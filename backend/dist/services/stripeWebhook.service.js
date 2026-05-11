"use strict";
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
exports.markPaymentAsFailed = exports.buildMetadata = exports.handleStripeEvent = void 0;
/**
 * Stripe Webhook Service
 * Handles asynchronous notifications from Stripe regarding payment and checkout session events.
 */
const stripe_1 = __importDefault(require("stripe"));
const transaction_enum_1 = require("../enums/transaction.enum");
const logger_1 = __importDefault(require("../utils/logger"));
const payment_logger_1 = require("../services/logger/payment.logger");
const stripeWebhook_repository_1 = require("../repositories/stripeWebhook.repository");
const dotenv_1 = __importDefault(require("dotenv"));
const log_enum_1 = require("../enums/log.enum");
const bookingManagementCache_util_1 = require("../utils/caching-utils/bookingManagementCache.util");
const messages_1 = require("../constants/messages");
const mail_util_1 = require("../utils/mail.util");
dotenv_1.default.config();
const stripe = new stripe_1.default(process.env.STRIPE_SECRET_KEY || "", {
    apiVersion: "2026-03-25.dahlia",
});
/**
 * Main entry point for Stripe webhook events.
 * Routes events to specific handlers based on the event type.
 */
const handleStripeEvent = (event) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        switch (event.type) {
            case "checkout.session.completed":
                return handleCheckoutCompleted(event.data.object);
            case "payment_intent.payment_failed":
                return handlePaymentFailed(event.data.object);
            case "checkout.session.expired":
                return handleSessionExpired(event.data.object);
            default:
                logger_1.default.debug("Unhandled Stripe event", { type: event.type });
        }
    }
    catch (err) {
        logger_1.default.error("Stripe webhook error", { error: err });
        throw err;
    }
});
exports.handleStripeEvent = handleStripeEvent;
/**
 * Prepares a structured object for booking and payment updates based on existing records.
 */
const buildMetadata = (payment, booking, serviceName) => ({
    userId: payment.userId,
    serviceId: payment.serviceId,
    addressId: payment.addressId,
    slot: payment.slot,
    paymentMethod: payment.paymentMethod,
    paymentGateway: payment.paymentGateway || transaction_enum_1.PaymentGateway.STRIPE,
    amount: Number(payment.amount),
    tax: Number(payment.tax),
    discount: Number(payment.discount),
    totalAmount: Number(payment.totalAmount),
    serviceName,
    serviceDuration: (booking === null || booking === void 0 ? void 0 : booking.serviceDuration) || 0,
    serviceAddress: (booking === null || booking === void 0 ? void 0 : booking.serviceAddress) || "",
    partnerId: payment.servicePartnerId || 0,
});
exports.buildMetadata = buildMetadata;
/**
 * Generates a human-readable success message for logging.
 */
const buildSuccessMessage = (payment, service, user) => `Payment of ${payment.currency.toUpperCase() === "USD" ? "$" : ""}${payment.totalAmount} was successful${(service === null || service === void 0 ? void 0 : service.name) ? ` for booking "${service.name}"` : ""}${(user === null || user === void 0 ? void 0 : user.email) ? ` by ${user.email}` : ""} via Stripe`;
/**
 * Handles 'checkout.session.completed' event.
 * Updates payment and booking statuses to 'PAID' and 'PENDING' respectively.
 */
const handleCheckoutCompleted = (session) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const paymentId = Number((_a = session.metadata) === null || _a === void 0 ? void 0 : _a.paymentId);
    const bookingId = Number((_b = session.metadata) === null || _b === void 0 ? void 0 : _b.bookingId);
    if (!paymentId || !bookingId) {
        logger_1.default.error(messages_1.MESSAGES.BOOKING.MISSING_PAYMENT_ID_OR_BOOKING_ID, {
            paymentId,
            bookingId,
        });
        return;
    }
    // 1. Fetch core records in parallel using repository for better performance
    const [payment, booking] = yield Promise.all([
        (0, stripeWebhook_repository_1.findPaymentById)(paymentId),
        (0, stripeWebhook_repository_1.findBookingById)(bookingId),
    ]);
    // 2. Early exit if records are missing or if it's a duplicate webhook (Idempotency)
    if (!payment || !booking) {
        logger_1.default.error(messages_1.MESSAGES.BOOKING.PAYMENT_OR_BOOKING_NOT_FOUND, { paymentId, bookingId });
        return;
    }
    const isExpired = booking.expiresAt && booking.expiresAt.getTime() < Date.now();
    // Lazy-load Service and User records only when needed for logging
    const loadContext = () => __awaiter(void 0, void 0, void 0, function* () {
        const [service, user] = yield Promise.all([
            (0, stripeWebhook_repository_1.findServiceById)(payment.serviceId),
            (0, stripeWebhook_repository_1.findUserById)(payment.userId),
        ]);
        return { service, user };
    });
    if (isExpired) {
        try {
            yield stripe.refunds.create({
                payment_intent: session.payment_intent,
                reason: "requested_by_customer",
                metadata: {
                    bookingId: booking.id.toString(),
                    paymentId: payment.id.toString(),
                    reason: messages_1.MESSAGES.BOOKING.BOOKING_EXPIRED_BEFORE_PAYMENT_COMPLETED,
                },
            });
            yield (0, stripeWebhook_repository_1.updateBookingAndPaymentWithTransaction)(booking, payment, {
                status: transaction_enum_1.BookingStatus.CANCELLED,
                cancellationReason: "Booking expired before payment completed",
            }, {
                paymentStatus: transaction_enum_1.PaymentStatus.REFUNDED,
                bookingStatus: transaction_enum_1.BookingStatus.CANCELLED,
                paymentIntentId: session.payment_intent,
                clientSecret: session.client_secret,
            });
            const { service, user } = yield loadContext();
            yield (0, payment_logger_1.logPaymentRefunded)({
                bookingId: booking.id,
                metadata: (0, exports.buildMetadata)(payment, booking, (service === null || service === void 0 ? void 0 : service.name) || ""),
                message: `Payment of ${payment.currency.toUpperCase() === "USD" ? log_enum_1.CurrencySymbol.USD : log_enum_1.CurrencySymbol.INR}${payment.totalAmount} was refunded to ${(user === null || user === void 0 ? void 0 : user.email) || "user"} for booking of "${(service === null || service === void 0 ? void 0 : service.name) || ""}" expired before payment completed with Stripe`,
            });
            (0, bookingManagementCache_util_1.clearBookingManagementCache)();
            return;
        }
        catch (refundError) {
            const { service } = yield loadContext();
            yield (0, payment_logger_1.logPaymentRefundFailed)({
                bookingId: booking.id,
                message: `Payment refund failed for expired booking of "${(service === null || service === void 0 ? void 0 : service.name) || ""}" with Stripe`,
                metadata: (0, exports.buildMetadata)(payment, booking, (service === null || service === void 0 ? void 0 : service.name) || ""),
            });
            throw refundError;
        }
    }
    if (payment.paymentStatus === transaction_enum_1.PaymentStatus.PAID) {
        logger_1.default.warn("Duplicate webhook ignored", { paymentId });
        return;
    }
    // 3. Normal update logic (Success branch)
    yield (0, stripeWebhook_repository_1.updateBookingAndPaymentWithTransaction)(booking, payment, { status: transaction_enum_1.BookingStatus.PENDING }, {
        paymentStatus: transaction_enum_1.PaymentStatus.PAID,
        bookingStatus: transaction_enum_1.BookingStatus.PENDING,
        paymentIntentId: session.payment_intent,
        clientSecret: session.client_secret,
        paidAt: new Date(),
    });
    // Lazy-load context for success logging
    const { service, user } = yield loadContext();
    (0, bookingManagementCache_util_1.clearBookingManagementCache)();
    // Send booking confirmation email to customer
    if (user === null || user === void 0 ? void 0 : user.email) {
        const amountStr = `${payment.currency.toUpperCase() === "USD" ? log_enum_1.CurrencySymbol.USD : log_enum_1.CurrencySymbol.INR}${payment.totalAmount}`;
        (0, mail_util_1.sendBookingConfirmationEmail)(user.email, user.name, booking.id, (service === null || service === void 0 ? void 0 : service.name) || "Service", booking.bookingDate.toLocaleString(), amountStr).catch((err) => {
            logger_1.default.error(`Failed to queue booking confirmation email: ${err instanceof Error ? err.message : String(err)}`);
        });
    }
    yield (0, payment_logger_1.logPaymentSuccess)({
        bookingId: booking.id,
        metadata: (0, exports.buildMetadata)(payment, booking, (service === null || service === void 0 ? void 0 : service.name) || ""),
        message: buildSuccessMessage(payment, service, user || undefined),
    });
});
/**
 * Common logic to mark a payment as failed and cancel the associated booking.
 */
const markPaymentAsFailed = (_a) => __awaiter(void 0, [_a], void 0, function* ({ paymentId, bookingId, cancellationReason, }) {
    const payment = yield (0, stripeWebhook_repository_1.findPaymentById)(paymentId);
    if (!payment) {
        logger_1.default.error(messages_1.MESSAGES.PAYMENT.NOT_FOUND, { paymentId });
        return;
    }
    // Idempotency guard: If already failed, skip
    if (payment.paymentStatus === transaction_enum_1.PaymentStatus.FAILED)
        return;
    const service = yield (0, stripeWebhook_repository_1.findServiceById)(payment.serviceId);
    yield (0, stripeWebhook_repository_1.updatePayment)(payment, {
        paymentStatus: transaction_enum_1.PaymentStatus.FAILED,
        bookingStatus: transaction_enum_1.BookingStatus.CANCELLED,
    });
    if (!bookingId) {
        return;
    }
    const booking = yield (0, stripeWebhook_repository_1.findBookingById)(bookingId);
    if (!booking)
        return;
    yield (0, stripeWebhook_repository_1.updateBookingAndPaymentWithTransaction)(booking, payment, {
        status: transaction_enum_1.BookingStatus.CANCELLED,
        cancellationReason: cancellationReason || "Cancelled from payment gateway",
    }, {
        paymentStatus: transaction_enum_1.PaymentStatus.FAILED,
        bookingStatus: transaction_enum_1.BookingStatus.CANCELLED,
    });
    (0, bookingManagementCache_util_1.clearBookingManagementCache)();
    // Log the failure for audit trails
    yield (0, payment_logger_1.logPaymentFailed)({
        bookingId: booking.id,
        metadata: (0, exports.buildMetadata)(payment, booking, (service === null || service === void 0 ? void 0 : service.name) || ""),
        message: `Payment failed${(service === null || service === void 0 ? void 0 : service.name) ? ` for booking '${service.name}'` : ""} due to ${cancellationReason || "unknown"} with Stripe`,
    });
});
exports.markPaymentAsFailed = markPaymentAsFailed;
/**
 * Handles 'payment_intent.payment_failed' event.
 */
const handlePaymentFailed = (intent) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e;
    const paymentId = Number((_a = intent.metadata) === null || _a === void 0 ? void 0 : _a.paymentId);
    const bookingId = (_b = intent.metadata) === null || _b === void 0 ? void 0 : _b.bookingId;
    if (!paymentId)
        return;
    const failureReason = ((_c = intent.last_payment_error) === null || _c === void 0 ? void 0 : _c.message) ||
        ((_d = intent.last_payment_error) === null || _d === void 0 ? void 0 : _d.decline_code) ||
        ((_e = intent.last_payment_error) === null || _e === void 0 ? void 0 : _e.code) ||
        messages_1.MESSAGES.PAYMENT.PAYMENT_FAILED;
    return (0, exports.markPaymentAsFailed)({
        paymentId,
        bookingId: bookingId ? Number(bookingId) : undefined,
        cancellationReason: failureReason,
    });
});
/**
 * Handles 'checkout.session.expired' event.
 * Occurs when a user starts checkout but doesn't complete it within the Stripe timeout.
 */
const handleSessionExpired = (session) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const paymentId = Number((_a = session.metadata) === null || _a === void 0 ? void 0 : _a.paymentId);
    const bookingId = (_b = session.metadata) === null || _b === void 0 ? void 0 : _b.bookingId;
    if (!paymentId)
        return;
    return (0, exports.markPaymentAsFailed)({
        paymentId,
        bookingId: bookingId ? Number(bookingId) : undefined,
        cancellationReason: messages_1.MESSAGES.BOOKING.USER_DID_NOT_COMPLETE_PAYMENT_WITHIN_TIME_LIMIT,
    });
});
