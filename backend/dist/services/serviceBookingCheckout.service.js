"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.retryBookingPaymentService = exports.getBookingWithPaymentService = exports.processBookingPayment = exports.getAvailablePartner = void 0;
const models_1 = require("../models");
const apiError_util_1 = require("../utils/apiError.util");
const logger_1 = __importDefault(require("../utils/logger"));
const stripe_1 = __importDefault(require("stripe"));
const razorpay_1 = __importDefault(require("razorpay"));
const dotenv_1 = __importDefault(require("dotenv"));
const common_utils_1 = require("../utils/common.utils");
const transaction_enum_1 = require("../enums/transaction.enum");
const bookingManagementCache_util_1 = require("../utils/caching-utils/bookingManagementCache.util");
const enums_1 = require("../enums");
const payment_logger_1 = require("../services/logger/payment.logger");
const booking_logger_1 = require("./logger/booking.logger");
const serviceProvider_logger_1 = require("./logger/serviceProvider.logger");
const adminBookingManagement_util_1 = require("../utils/adminBookingManagement.util");
const logger_service_1 = require("./logger.service");
const messages_1 = require("../constants/messages");
const log_enum_1 = require("../enums/log.enum");
const repository = __importStar(require("../repositories/serviceBookingCheckout.repository"));
const constants_1 = require("../constants");
const couponUsage_service_1 = require("./couponUsage.service");
dotenv_1.default.config();
// Configuration and environment variables
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || "";
const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || "";
const RAZORPAY_SECRET_KEY = process.env.RAZORPAY_SECRET_KEY || "";
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";
// Initialize payment gateway clients
const stripe = new stripe_1.default(STRIPE_SECRET_KEY, {
    apiVersion: "2026-03-25.dahlia",
});
const razorpay = new razorpay_1.default({
    key_id: RAZORPAY_KEY_ID,
    key_secret: RAZORPAY_SECRET_KEY,
});
/**
 * Finds an available service partner for a specific category and time slot.
 */
const getAvailablePartner = (_a) => __awaiter(void 0, [_a], void 0, function* ({ subCategoryId, bookingDate, duration, }) {
    const SLOT_DURATION = Math.min(duration / 2, constants_1.MAX_BUFFER_MINUTES) * constants_1.MS_IN_MINUTE;
    const newStart = bookingDate.getTime();
    const newEnd = newStart + SLOT_DURATION;
    // 1. Fetch eligible partners
    const eligiblePartners = yield repository.findEligiblePartners(subCategoryId);
    if (!eligiblePartners.length) {
        throw new apiError_util_1.ApiError(enums_1.STATUS_CODE.BAD_REQUEST, messages_1.MESSAGES.SERVICE.NO_PARTNER_AVAILABLE);
    }
    const partnerIds = eligiblePartners.map((p) => p.id);
    // 2. Fetch all relevant bookings in ONE query
    const bookings = yield repository.findRelevantBookings(partnerIds);
    // 3. Group bookings by partnerId to facilitate easier availability checks
    const bookingsMap = new Map();
    for (const booking of bookings) {
        const list = bookingsMap.get(booking.servicePartnerId) || [];
        list.push(booking);
        bookingsMap.set(booking.servicePartnerId, list);
    }
    // 4. Filter available partners by checking for overlapping booking slots
    const availablePartners = eligiblePartners.filter((partner) => {
        const partnerBookings = bookingsMap.get(Number(partner.id)) || [];
        return !partnerBookings.some((b) => {
            const bStart = new Date(b.bookingDate).getTime();
            // Calculate end time: duration is halved or capped at 60 mins (business rule)
            const bEnd = bStart + Math.min((b.serviceDuration || 0) / 2, constants_1.MAX_BUFFER_MINUTES) * constants_1.MS_IN_MINUTE;
            // Check for overlap between new booking and existing ones
            return newStart < bEnd && newEnd > bStart;
        });
    });
    if (!availablePartners.length) {
        throw new apiError_util_1.ApiError(enums_1.STATUS_CODE.BAD_REQUEST, messages_1.MESSAGES.SERVICE.NO_PARTNER_AVAILABLE_FOR_SLOT);
    }
    // 5. Random selection
    return availablePartners[Math.floor(Math.random() * availablePartners.length)];
});
exports.getAvailablePartner = getAvailablePartner;
/**
 * Orchestrates the entire booking payment process.
 * Validates input, checks for existing payments, finds a partner,
 * and delegates to specific payment handlers (Stripe, Razorpay, or Cash).
 */
const processBookingPayment = (input) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f;
    validateBookingInput(input);
    const alreadyPaid = yield repository.findPaidPayment(input.userId, input.serviceId, input.slot);
    if (alreadyPaid) {
        throw new apiError_util_1.ApiError(enums_1.STATUS_CODE.BAD_REQUEST, messages_1.MESSAGES.SERVICE.ALREADY_PAID);
    }
    const existingPayment = yield repository.findPendingPayment(input.userId, input.serviceId, input.slot);
    // Check if an active payment session already exists to avoid duplicate charges
    if (existingPayment) {
        const booking = yield repository.findBookingByPaymentId(existingPayment.id);
        if ((booking === null || booking === void 0 ? void 0 : booking.expiresAt) &&
            booking.expiresAt.getTime() < new Date().getTime()) {
            throw new apiError_util_1.ApiError(enums_1.STATUS_CODE.BAD_REQUEST, messages_1.MESSAGES.SERVICE.SLOT_EXPIRED);
        }
        if (existingPayment === null || existingPayment === void 0 ? void 0 : existingPayment.sessionId) {
            const session = yield stripe.checkout.sessions.retrieve(existingPayment.sessionId);
            // If already paid, return early with success message
            if (session.payment_status === "paid") {
                return {
                    bookingId: (booking === null || booking === void 0 ? void 0 : booking.id) || 0,
                    paymentMethod: transaction_enum_1.PaymentMethod.CARD,
                    paymentGateway: transaction_enum_1.PaymentGateway.STRIPE,
                    amount: Number(existingPayment.totalAmount),
                    message: messages_1.MESSAGES.PAYMENT.ALREADY_COMPLETED,
                };
            }
            // If session is still open, reuse the existing sessionId
            if (session.status === "open") {
                return {
                    bookingId: (booking === null || booking === void 0 ? void 0 : booking.id) || 0,
                    paymentMethod: transaction_enum_1.PaymentMethod.CARD,
                    amount: Number(existingPayment.totalAmount),
                    message: messages_1.MESSAGES.PAYMENT.REUSING_EXISTING_STRIPE_SESSION,
                    paymentGateway: transaction_enum_1.PaymentGateway.STRIPE,
                    sessionId: existingPayment.sessionId,
                };
            }
        }
        if (existingPayment === null || existingPayment === void 0 ? void 0 : existingPayment.orderId) {
            return {
                bookingId: (booking === null || booking === void 0 ? void 0 : booking.id) || 0,
                paymentMethod: transaction_enum_1.PaymentMethod.CARD,
                message: messages_1.MESSAGES.PAYMENT.REUSING_EXISTING_RAZORPAY_SESSION,
                paymentGateway: transaction_enum_1.PaymentGateway.RAZORPAY,
                sessionId: existingPayment.sessionId,
                orderId: existingPayment.orderId || "",
                amount: Number(existingPayment.totalAmount),
            };
        }
    }
    const [service, offer, address, user] = yield Promise.all([
        repository.findServiceWithContext(input.serviceId),
        input.couponId ? repository.findOfferById(input.couponId) : null,
        repository.findAddressById(input.addressId),
        repository.findUserById(input.userId),
    ]);
    if (!service)
        throw new apiError_util_1.ApiError(enums_1.STATUS_CODE.NOT_FOUND, messages_1.MESSAGES.SERVICE.NOT_FOUND);
    let serviceTypeId = (_c = (_b = (_a = service === null || service === void 0 ? void 0 : service.subCategory) === null || _a === void 0 ? void 0 : _a.category) === null || _b === void 0 ? void 0 : _b.serviceType) === null || _c === void 0 ? void 0 : _c.id;
    if (!serviceTypeId && (service === null || service === void 0 ? void 0 : service.categoryId)) {
        const category = yield models_1.Category.findByPk(Number(service.categoryId), {
            attributes: ["id"],
            include: [
                {
                    model: models_1.ServiceType,
                    as: "serviceType",
                    attributes: ["id"],
                    required: true,
                },
            ],
        });
        serviceTypeId = (_d = category === null || category === void 0 ? void 0 : category.serviceType) === null || _d === void 0 ? void 0 : _d.id;
    }
    const serviceAddress = [
        address === null || address === void 0 ? void 0 : address.houseFlatNumber,
        address === null || address === void 0 ? void 0 : address.landmark,
        address === null || address === void 0 ? void 0 : address.address,
    ]
        .filter(Boolean)
        .join(", ");
    const amounts = computeAmounts({
        amount: Number(service.price),
        tax: input.tax,
        offerDiscountPercentage: (offer === null || offer === void 0 ? void 0 : offer.isActive)
            ? Number(offer.discountPercentage || 0)
            : 0,
    });
    let payload = Object.assign(Object.assign(Object.assign({}, input), amounts), { serviceName: service.name, serviceDuration: service.duration || 0, serviceAddress, serviceTypeId: serviceTypeId ? Number(serviceTypeId) : undefined, userEmail: user === null || user === void 0 ? void 0 : user.email });
    const message = `Customer clicked on book service${(service === null || service === void 0 ? void 0 : service.name) ? ` for "${service.name}"` : ""}${((_e = input === null || input === void 0 ? void 0 : input.slot) === null || _e === void 0 ? void 0 : _e.date)
        ? ` scheduled on ${(0, adminBookingManagement_util_1.formatDateShort)(new Date(input.slot.date))}`
        : ""}${((_f = input === null || input === void 0 ? void 0 : input.slot) === null || _f === void 0 ? void 0 : _f.time) ? ` at ${input.slot.time}` : ""}.`;
    (0, booking_logger_1.logBookingInitiated)({
        metadata: payload,
        message,
    });
    const partner = yield (0, exports.getAvailablePartner)({
        subCategoryId: service.subCategoryId,
        bookingDate: (0, common_utils_1.parseBookingDate)(input.slot.date, input.slot.time),
        duration: service.duration || 0,
    });
    if (!partner)
        throw new apiError_util_1.ApiError(enums_1.STATUS_CODE.BAD_REQUEST, messages_1.MESSAGES.SERVICE.NO_PARTNER_AVAILABLE_FOR_SLOT);
    payload.partnerId = partner.id;
    (0, payment_logger_1.logPaymentInitiated)({
        metadata: payload,
        message: `Payment initiated for service ${service.name} by ${user === null || user === void 0 ? void 0 : user.email} on ${(0, adminBookingManagement_util_1.formatDateShort)(new Date(input.slot.date))} at ${input.slot.time}` ||
            "",
    });
    if (input.paymentMethod === transaction_enum_1.PaymentMethod.CASH) {
        return handleCash(payload);
    }
    const { booking, payment } = yield createRecords(payload);
    if (input.paymentGateway === transaction_enum_1.PaymentGateway.STRIPE) {
        return stripeCheckout({
            bookingId: booking.id,
            userId: payload.userId,
            serviceId: payload.serviceId,
            paymentId: payment.id,
            userEmail: payload.userEmail || "",
            serviceName: payload.serviceName,
            slot: payload.slot,
            totalAmount: payload.totalAmount,
        });
    }
    else {
        return razorpayCheckout({
            bookingId: booking.id,
            serviceId: payload.serviceId,
            paymentId: payment.id,
            userId: payload.userId,
            totalAmount: payload.totalAmount,
        });
    }
});
exports.processBookingPayment = processBookingPayment;
/**
 * Finalizes a booking that uses Cash as the payment method.
 */
const handleCash = (input) => __awaiter(void 0, void 0, void 0, function* () {
    const { booking } = yield createRecords(input);
    (0, bookingManagementCache_util_1.clearBookingManagementCache)();
    yield (0, logger_service_1.logEvent)({
        eventType: log_enum_1.LogEventType.BOOK_SERVICE_CONFIRM,
        category: log_enum_1.LogCategory.BOOKING,
        userId: input.userId,
        serviceId: input.serviceId,
        status: log_enum_1.LogStatus.SUCCESS,
        metadata: {
            amount: input.totalAmount,
            paymentMethod: input.paymentMethod,
            paymentGateway: input.paymentGateway,
        },
        message: messages_1.MESSAGES.BOOKING.CONFIRMED_WITH_CASH_PAYMENT,
    });
    return {
        bookingId: booking.id,
        paymentMethod: transaction_enum_1.PaymentMethod.CASH,
        paymentGateway: input.paymentGateway,
        amount: Number(input.totalAmount),
        message: messages_1.MESSAGES.BOOKING.CONFIRMED_WITH_CASH_PAYMENT,
    };
});
/**
 * Initiates a Stripe Checkout session for card payments.
 */
const stripeCheckout = (_a) => __awaiter(void 0, [_a], void 0, function* ({ bookingId, userId, serviceId, paymentId, userEmail, serviceName, slot, totalAmount, }) {
    try {
        const session = yield stripe.checkout.sessions.create({
            mode: "payment",
            payment_method_types: ["card"],
            customer_email: userEmail,
            line_items: [
                {
                    price_data: {
                        currency: log_enum_1.CurrencyValueSymbol.USD,
                        product_data: {
                            name: serviceName,
                            description: `Service scheduled on ${slot.date} at ${slot.time}`,
                        },
                        unit_amount: Math.round(totalAmount * 100),
                    },
                    quantity: 1,
                },
            ],
            payment_intent_data: {
                metadata: {
                    bookingId: bookingId.toString(),
                    paymentId: paymentId.toString(),
                },
            },
            success_url: `${FRONTEND_URL}/checkout/success/${bookingId}`,
            cancel_url: `${FRONTEND_URL}/checkout/${serviceId}?bookingId=${bookingId}`,
            metadata: {
                bookingId: bookingId.toString(),
                paymentId: paymentId.toString(),
            },
        });
        yield repository.updatePayment(paymentId, {
            orderId: "",
            sessionId: session.id,
        });
        return {
            bookingId,
            paymentMethod: transaction_enum_1.PaymentMethod.CARD,
            paymentGateway: transaction_enum_1.PaymentGateway.STRIPE,
            amount: totalAmount,
            message: messages_1.MESSAGES.PAYMENT.REDIRECTING_TO_STRIPE_CHECKOUT,
            sessionId: session.id,
        };
    }
    catch (err) {
        if (bookingId) {
            yield (0, payment_logger_1.logPaymentFailed)({
                bookingId,
                metadata: { userId, serviceId },
                message: messages_1.MESSAGES.PAYMENT.STRIPE_ERROR,
            });
        }
        throw new apiError_util_1.ApiError(enums_1.STATUS_CODE.BAD_REQUEST, messages_1.MESSAGES.PAYMENT.STRIPE_ERROR);
    }
});
/**
 * Creates a Razorpay order for card payments.
 */
const razorpayCheckout = (_a) => __awaiter(void 0, [_a], void 0, function* ({ bookingId, serviceId, paymentId, userId, totalAmount, }) {
    try {
        const order = yield razorpay.orders.create({
            amount: Math.round(totalAmount * 100),
            currency: log_enum_1.CurrencyValueSymbol.USD,
            receipt: `receipt_${bookingId}`,
        });
        yield repository.updatePayment(paymentId, {
            orderId: order.id,
            sessionId: "",
        });
        return {
            bookingId,
            paymentMethod: transaction_enum_1.PaymentMethod.CARD,
            paymentGateway: transaction_enum_1.PaymentGateway.RAZORPAY,
            amount: totalAmount,
            message: messages_1.MESSAGES.BOOKING.RAZORPAY_ORDER_CREATED,
            orderId: order.id,
        };
    }
    catch (err) {
        if (bookingId) {
            yield (0, payment_logger_1.logPaymentFailed)({
                bookingId,
                metadata: { userId, serviceId },
                message: (err === null || err === void 0 ? void 0 : err.message) || messages_1.MESSAGES.PAYMENT.RAZORPAY_ERROR,
            });
        }
        logger_1.default.error(`Razorpay error: ${err === null || err === void 0 ? void 0 : err.message}`);
        throw new apiError_util_1.ApiError(enums_1.STATUS_CODE.BAD_REQUEST, (err === null || err === void 0 ? void 0 : err.message) || messages_1.MESSAGES.PAYMENT.RAZORPAY_ERROR);
    }
});
/**
 * Atomically creates Booking and Payment records in the database.
 * Also logs the assignment of the service provider and blocks the slot.
 */
const createRecords = (input) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const bookingDate = (0, common_utils_1.parseBookingDate)(input.slot.date, input.slot.time);
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + constants_1.EXPIRED_MINUTES);
    if (input.couponId) {
        yield (0, couponUsage_service_1.createCouponUsage)(String(input.couponId), String(input.userId));
    }
    const { booking, payment } = yield repository.createBookingAndPaymentWithTransaction({
        userId: input.userId,
        serviceId: input.serviceId,
        serviceTypeId: input.serviceTypeId,
        status: transaction_enum_1.BookingStatus.PENDING,
        bookingDate,
        amount: input.totalAmount,
        serviceAddress: input.serviceAddress,
        serviceDuration: input.serviceDuration,
        servicePartnerId: input.partnerId,
        expiresAt,
    }, {
        userId: input.userId,
        serviceId: input.serviceId,
        addressId: input.addressId,
        slot: input.slot,
        amount: toFixed(input.amount),
        tax: toFixed(input.tax),
        discount: toFixed(input.discount),
        totalAmount: toFixed(input.totalAmount),
        currency: log_enum_1.CurrencyValueSymbol.USD,
        paymentMethod: input.paymentMethod,
        paymentGateway: input.paymentGateway,
        paymentStatus: transaction_enum_1.PaymentStatus.PENDING,
        bookingStatus: transaction_enum_1.BookingStatus.PENDING,
        couponId: input.couponId,
        servicePartnerId: input.partnerId,
    });
    const partner = yield repository.findPartnerById(input.partnerId);
    if (!partner)
        throw new apiError_util_1.ApiError(enums_1.STATUS_CODE.BAD_REQUEST, "Partner not found");
    const partnerUser = yield repository.findUserById(partner.userId);
    if (!partnerUser)
        throw new apiError_util_1.ApiError(enums_1.STATUS_CODE.BAD_REQUEST, "Partner user not found");
    yield (0, serviceProvider_logger_1.logServiceProviderAssigned)({
        metadata: input,
        message: `Service Provider ${(partnerUser === null || partnerUser === void 0 ? void 0 : partnerUser.name) ? `'${partnerUser.name}'` : ""} has been assigned to service '${input.serviceName}' on ${(0, adminBookingManagement_util_1.formatDateShort)(new Date(input.slot.date))} at ${input.slot.time}`,
    });
    const blockedMessage = `Blocked service for ${constants_1.EXPIRED_MINUTES} minutes${(input === null || input === void 0 ? void 0 : input.serviceName) ? `: '${input.serviceName}'` : ""}${(partnerUser === null || partnerUser === void 0 ? void 0 : partnerUser.name) ? ` with partner '${partnerUser.name}'` : ""} has been placed after successful payment and is currently under hold${((_a = input === null || input === void 0 ? void 0 : input.slot) === null || _a === void 0 ? void 0 : _a.date)
        ? ` on slot of ${(0, adminBookingManagement_util_1.formatDateShort)(new Date(input.slot.date))}`
        : ""}${((_b = input === null || input === void 0 ? void 0 : input.slot) === null || _b === void 0 ? void 0 : _b.time) ? ` at ${input.slot.time}` : ""}`;
    yield (0, booking_logger_1.logBookingBlocked)({
        metadata: input,
        message: blockedMessage,
    });
    (0, bookingManagementCache_util_1.clearBookingManagementCache)();
    return { booking, payment };
});
/**
 * Calculates the financial breakdown of a booking including discounts and taxes.
 */
const computeAmounts = ({ amount, tax = 0, offerDiscountPercentage = 0, }) => {
    // cap discount to amount
    const discount = Number(Math.min((amount * offerDiscountPercentage) / 100, amount));
    const amountWithCoupon = Number(Math.max(0, amount - discount));
    // tax only on taxable value
    const taxAmount = Number((amount * tax) / 100);
    const totalAmount = Number(amountWithCoupon + taxAmount);
    return { amount, tax, discount, totalAmount };
};
/**
 * Helper to format numbers to a two-decimal place string.
 */
const toFixed = (v) => v.toFixed(2);
/**
 * Validates the structure and content of the booking payment request.
 */
const validateBookingInput = (input) => {
    var _a, _b;
    if (!(input === null || input === void 0 ? void 0 : input.userId) || !(input === null || input === void 0 ? void 0 : input.serviceId) || !(input === null || input === void 0 ? void 0 : input.addressId)) {
        throw new apiError_util_1.ApiError(enums_1.STATUS_CODE.BAD_REQUEST, messages_1.MESSAGES.COMMON.INVALID_IDENTIFIERS);
    }
    if (!((_a = input.slot) === null || _a === void 0 ? void 0 : _a.date) || !((_b = input.slot) === null || _b === void 0 ? void 0 : _b.time)) {
        throw new apiError_util_1.ApiError(enums_1.STATUS_CODE.BAD_REQUEST, messages_1.MESSAGES.COMMON.INVALID_SLOT);
    }
    if (Number.isNaN(new Date(input.slot.date).getTime())) {
        throw new apiError_util_1.ApiError(enums_1.STATUS_CODE.BAD_REQUEST, messages_1.MESSAGES.COMMON.INVALID_DATE);
    }
    if (![transaction_enum_1.PaymentMethod.CASH, transaction_enum_1.PaymentMethod.CARD].includes(input.paymentMethod)) {
        throw new apiError_util_1.ApiError(enums_1.STATUS_CODE.BAD_REQUEST, messages_1.MESSAGES.COMMON.INVALID_PAYMENT_METHOD);
    }
    if (input.paymentGateway &&
        ![transaction_enum_1.PaymentGateway.STRIPE, transaction_enum_1.PaymentGateway.RAZORPAY].includes(input.paymentGateway)) {
        throw new apiError_util_1.ApiError(enums_1.STATUS_CODE.BAD_REQUEST, messages_1.MESSAGES.COMMON.INVALID_PAYMENT_GATEWAY);
    }
    if (input.tax && typeof input.tax !== "number") {
        throw new apiError_util_1.ApiError(enums_1.STATUS_CODE.BAD_REQUEST, messages_1.MESSAGES.COMMON.INVALID_TAX);
    }
};
/**
 * Retrieves a booking record along with its associated payment details.
 */
const getBookingWithPaymentService = (bookingId) => __awaiter(void 0, void 0, void 0, function* () {
    const booking = yield repository.findBookingWithPayment(bookingId);
    if (!booking)
        throw new apiError_util_1.ApiError(enums_1.STATUS_CODE.BAD_REQUEST, messages_1.MESSAGES.BOOKING.NOT_FOUND);
    return booking;
});
exports.getBookingWithPaymentService = getBookingWithPaymentService;
/**
 * Allows a user to retry the payment for an existing booking that is pending or failed.
 * Currently supports finalization for cash payments.
 */
const retryBookingPaymentService = (_a) => __awaiter(void 0, [_a], void 0, function* ({ bookingId, paymentMethod, paymentGateway, }) {
    const booking = yield repository.findBookingById(bookingId);
    if (!booking || !booking.paymentId) {
        throw new apiError_util_1.ApiError(enums_1.STATUS_CODE.BAD_REQUEST, messages_1.MESSAGES.BOOKING.NOT_FOUND_OR_PAYMENT_NOT_LINKED);
    }
    const payment = yield repository.findPaymentById(booking.paymentId);
    if (!payment) {
        throw new apiError_util_1.ApiError(enums_1.STATUS_CODE.BAD_REQUEST, messages_1.MESSAGES.PAYMENT.NOT_FOUND);
    }
    const [service, user] = yield Promise.all([
        repository.findServiceWithContext(booking.serviceId),
        repository.findUserById(booking.userId),
    ]);
    const isBookingValid = constants_1.RETRIED_BOOKING_STATUS.includes(booking.status);
    const isPaymentValid = constants_1.RETRIED_PAYMENT_STATUS.includes(payment.paymentStatus);
    const isNotExpired = booking.expiresAt && Date.now() < booking.expiresAt.getTime();
    const isEligibleForRetry = isBookingValid && isPaymentValid && isNotExpired;
    if (!isNotExpired) {
        throw new apiError_util_1.ApiError(enums_1.STATUS_CODE.BAD_REQUEST, `Booking for ${(service === null || service === void 0 ? void 0 : service.name) || ""} with slot ${(0, adminBookingManagement_util_1.formatDateShort)(new Date(payment.slot.date))}, ${payment.slot.time} is already expired so it's not eligible for retry`);
    }
    if (!isEligibleForRetry) {
        throw new apiError_util_1.ApiError(4, `Booking for ${(service === null || service === void 0 ? void 0 : service.name) || ""} was already ${booking.status.toLowerCase()} and expired so it's not eligible for retry`);
    }
    if (payment.paymentMethod === transaction_enum_1.PaymentMethod.CASH) {
        yield repository.updateBookingAndPaymentWithTransaction(booking, payment, { status: transaction_enum_1.BookingStatus.PENDING }, {
            paymentStatus: transaction_enum_1.PaymentStatus.PENDING,
            bookingStatus: transaction_enum_1.BookingStatus.PENDING,
            paymentMethod: transaction_enum_1.PaymentMethod.CASH,
        });
        return {
            bookingId: booking.id,
            paymentMethod: transaction_enum_1.PaymentMethod.CASH,
            message: messages_1.MESSAGES.BOOKING.CONFIRMED_WITH_CASH_PAYMENT,
            amount: Number(payment.totalAmount),
        };
    }
    if (paymentMethod === transaction_enum_1.PaymentMethod.CARD) {
        const cardPayload = {
            bookingId,
            userId: booking.userId,
            serviceId: booking.serviceId,
            paymentId: booking.paymentId,
            userEmail: (user === null || user === void 0 ? void 0 : user.email) || "",
            serviceName: (service === null || service === void 0 ? void 0 : service.name) || "",
            slot: payment.slot || 0,
            totalAmount: Number(payment.totalAmount),
        };
        if (paymentGateway === transaction_enum_1.PaymentGateway.STRIPE) {
            return stripeCheckout(cardPayload);
        }
        if (paymentGateway === transaction_enum_1.PaymentGateway.RAZORPAY) {
            return razorpayCheckout(cardPayload);
        }
        return {
            bookingId: booking.id,
            paymentMethod: transaction_enum_1.PaymentMethod.CARD,
            message: messages_1.MESSAGES.BOOKING.CONFIRMED_WITH_CARD_PAYMENT,
            amount: Number(payment.totalAmount),
            paymentGateway,
        };
    }
    return {
        bookingId: booking.id,
        paymentMethod: paymentMethod,
        message: messages_1.MESSAGES.PAYMENT.PAYMENT_METHOD_NOT_SUPPORTED,
        amount: Number(payment.totalAmount),
        paymentGateway,
    };
});
exports.retryBookingPaymentService = retryBookingPaymentService;
