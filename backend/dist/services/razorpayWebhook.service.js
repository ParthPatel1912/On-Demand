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
exports.markPaymentAsFailed = exports.handleRazorpayEvent = void 0;
const transaction_enum_1 = require("../enums/transaction.enum");
const logger_1 = __importDefault(require("../utils/logger"));
const payment_logger_1 = require("./logger/payment.logger");
const stripeWebhook_service_1 = require("./stripeWebhook.service");
const razorpay_1 = __importDefault(require("razorpay"));
const db_1 = __importDefault(require("../configs/db"));
const log_enum_1 = require("../enums/log.enum");
const RazorpayWebhookRepository = __importStar(require("../repositories/razorpayWebhook.repository"));
const mail_util_1 = require("../utils/mail.util");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const razorpay = new razorpay_1.default({
    key_id: process.env.RAZORPAY_KEY_ID || "",
    key_secret: process.env.RAZORPAY_SECRET_KEY || "",
});
/**
 * @name handleRazorpayEvent
 * @description
 * Main handler for Razorpay webhook events. Routes events to specific handlers based on event type.
 * Handles payment success, failure and order expiration events to update booking and payment records accordingly.
 * @access Private
 */
const handleRazorpayEvent = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const event = payload.event;
    const data = payload.payload;
    logger_1.default.info(`Razorpay Webhook Event: ${event}`);
    try {
        switch (event) {
            case "payment.captured":
            case "order.paid": {
                const orderId = data.order
                    ? data.order.entity.id
                    : data.payment.entity.order_id;
                return handleOrderPaid(orderId, data.payment.entity);
            }
            case "payment.failed":
                return handlePaymentFailed(data.payment.entity);
            case "order.notification.expired":
            case "order.expired":
                return handleOrderExpired(data.order.entity);
            default:
                logger_1.default.debug("Unhandled Razorpay event", { event });
        }
    }
    catch (err) {
        logger_1.default.error("Razorpay webhook error", { error: err });
        throw err;
    }
});
exports.handleRazorpayEvent = handleRazorpayEvent;
/**
 * @name handleOrderPaid
 * @description
 * Handles successful payment events. Updates payment and booking records to PAID and CONFIRMED respectively.
 * Also checks if the booking was expired before payment completion and initiates refund if necessary.
 * Loads service and user context for logging purposes. Logs payment success or refund events accordingly.
 * @access Private
 */
const handleOrderPaid = (orderId, paymentEntity) => __awaiter(void 0, void 0, void 0, function* () {
    const payment = yield RazorpayWebhookRepository.findPaymentByOrderId(orderId);
    if (!payment) {
        logger_1.default.error(`Payment not found for Razorpay Order ID: ${orderId}`);
        return;
    }
    if (payment.paymentStatus === transaction_enum_1.PaymentStatus.PAID)
        return;
    const booking = yield RazorpayWebhookRepository.findBookingByPaymentId(payment.id);
    if (!booking) {
        logger_1.default.error(`Booking not found for Payment ID: ${payment.id}`);
        return;
    }
    const isExpired = booking.expiresAt && booking.expiresAt.getTime() < Date.now();
    const loadContext = () => __awaiter(void 0, void 0, void 0, function* () {
        return yield RazorpayWebhookRepository.getServiceAndUserContext(payment.serviceId, payment.userId);
    });
    if (isExpired) {
        try {
            // Initiate refund for expired booking
            yield razorpay.payments.refund(paymentEntity.id, {
                notes: {
                    bookingId: booking.id.toString(),
                    paymentId: payment.id.toString(),
                    reason: "Booking expired before payment completed",
                },
            });
            yield RazorpayWebhookRepository.updatePaymentAndBookingWithTransaction(payment, booking, {
                paymentStatus: transaction_enum_1.PaymentStatus.REFUNDED,
                bookingStatus: transaction_enum_1.BookingStatus.CANCELLED,
                paymentIntentId: paymentEntity.id,
                paidAt: new Date(),
            }, {
                status: transaction_enum_1.BookingStatus.CANCELLED,
                cancellationReason: "Booking expired before payment completed",
            });
            const { service, user } = yield loadContext();
            yield (0, payment_logger_1.logPaymentRefunded)({
                bookingId: booking.id,
                metadata: (0, stripeWebhook_service_1.buildMetadata)(payment, booking, (service === null || service === void 0 ? void 0 : service.name) || ""),
                message: `Payment of ${payment.currency.toUpperCase() === "USD"
                    ? log_enum_1.CurrencySymbol.USD
                    : log_enum_1.CurrencySymbol.INR}${payment.totalAmount} was refunded to ${(user === null || user === void 0 ? void 0 : user.email) || "user"} for booking of "${(service === null || service === void 0 ? void 0 : service.name) || ""}" expired before payment completed via Razorpay`,
            });
            return;
        }
        catch (refundError) {
            const { service } = yield loadContext();
            yield (0, payment_logger_1.logPaymentRefundFailed)({
                bookingId: booking.id,
                message: `Payment refund failed for expired booking of "${(service === null || service === void 0 ? void 0 : service.name) || ""}" via Razorpay`,
                metadata: (0, stripeWebhook_service_1.buildMetadata)(payment, booking, (service === null || service === void 0 ? void 0 : service.name) || ""),
            });
            throw refundError;
        }
    }
    // Normal success flow
    yield RazorpayWebhookRepository.updatePaymentAndBookingWithTransaction(payment, booking, {
        paymentStatus: transaction_enum_1.PaymentStatus.PAID,
        bookingStatus: transaction_enum_1.BookingStatus.CONFIRMED,
        paymentIntentId: paymentEntity.id,
        paidAt: new Date(),
    }, { status: transaction_enum_1.BookingStatus.CONFIRMED });
    const { service, user } = yield loadContext();
    // Send booking confirmation email to customer
    if (user === null || user === void 0 ? void 0 : user.email) {
        const amountStr = `${payment.currency.toUpperCase() === "USD"
            ? log_enum_1.CurrencySymbol.USD
            : log_enum_1.CurrencySymbol.INR}${payment.totalAmount}`;
        (0, mail_util_1.sendBookingConfirmationEmail)(user.email, user.name, booking.id, (service === null || service === void 0 ? void 0 : service.name) || "Service", booking.bookingDate.toLocaleString(), amountStr).catch((err) => {
            logger_1.default.error(`Failed to send booking confirmation email: ${err.message}`);
        });
    }
    yield (0, payment_logger_1.logPaymentSuccess)({
        bookingId: booking.id,
        metadata: (0, stripeWebhook_service_1.buildMetadata)(payment, booking, (service === null || service === void 0 ? void 0 : service.name) || ""),
        message: `Payment of ${payment.currency.toUpperCase() === "USD"
            ? log_enum_1.CurrencySymbol.USD
            : log_enum_1.CurrencySymbol.INR}${payment.totalAmount} was successful${(service === null || service === void 0 ? void 0 : service.name) ? ` for booking "${service.name}"` : ""}${(user === null || user === void 0 ? void 0 : user.email) ? ` by ${user.email}` : ""} via Razorpay`,
    });
});
/**
 * @name markPaymentAsFailed
 * @description
 * Utility function to mark a payment as failed and cancel the associated booking if applicable.
 * Updates payment status to FAILED and booking status to CANCELLED with appropriate cancellation reason.
 * Loads service context for logging purposes. Logs payment failure event with metadata for debugging and analytics.
 * @access Private
 */
const markPaymentAsFailed = (_a) => __awaiter(void 0, [_a], void 0, function* ({ paymentId, bookingId, cancellationReason, }) {
    const payment = yield RazorpayWebhookRepository.findPaymentById(paymentId);
    if (!payment) {
        logger_1.default.error("Payment not found", { paymentId });
        return;
    }
    if (payment.paymentStatus === transaction_enum_1.PaymentStatus.FAILED)
        return;
    const service = yield RazorpayWebhookRepository.findServiceById(payment.serviceId);
    yield db_1.default.transaction((transaction) => __awaiter(void 0, void 0, void 0, function* () {
        yield payment.update({
            paymentStatus: transaction_enum_1.PaymentStatus.FAILED,
            bookingStatus: transaction_enum_1.BookingStatus.CANCELLED,
        }, { transaction });
        if (!bookingId)
            return;
        const booking = yield RazorpayWebhookRepository.findBookingById(bookingId);
        if (!booking)
            return;
        yield booking.update({
            status: transaction_enum_1.BookingStatus.CANCELLED,
            cancellationReason: cancellationReason || "Cancelled from payment gateway",
        }, { transaction });
        yield (0, payment_logger_1.logPaymentFailed)({
            bookingId: booking.id,
            metadata: (0, stripeWebhook_service_1.buildMetadata)(payment, booking, (service === null || service === void 0 ? void 0 : service.name) || ""),
            message: `Payment failed${(service === null || service === void 0 ? void 0 : service.name) ? ` for booking '${service.name}'` : ""} due to ${cancellationReason || "unknown"} via Razorpay`,
        });
    }));
});
exports.markPaymentAsFailed = markPaymentAsFailed;
/**
 * @name handlePaymentFailed
 * @description
 * Handles payment failure events from Razorpay. Finds the associated payment and booking records and marks the payment as failed.
 * Extracts error description from Razorpay event to use as cancellation reason. Logs a warning if payment record is not found for the given order ID.
 * @access Private
 */
const handlePaymentFailed = (paymentEntity) => __awaiter(void 0, void 0, void 0, function* () {
    const { order_id: orderId, error_description } = paymentEntity;
    const payment = yield RazorpayWebhookRepository.findPaymentByOrderId(orderId);
    if (!payment) {
        logger_1.default.warn(`Payment not found for Order: ${orderId}`);
        return;
    }
    const booking = yield RazorpayWebhookRepository.findBookingByPaymentId(payment.id);
    return (0, exports.markPaymentAsFailed)({
        paymentId: payment.id,
        bookingId: booking === null || booking === void 0 ? void 0 : booking.id,
        cancellationReason: error_description || "Payment failed",
    });
});
/**
 * @name handleOrderExpired
 * @description
 * Handles order expiration events from Razorpay. Finds the associated payment and booking records and marks the payment as failed with a specific cancellation reason indicating user did not complete payment within time limit.
 * Logs a warning if payment record is not found for the given order ID. This ensures that bookings are not left in limbo if the user fails to complete payment in time.
 * @access Private
 */
const handleOrderExpired = (orderEntity) => __awaiter(void 0, void 0, void 0, function* () {
    const payment = yield RazorpayWebhookRepository.findPaymentByOrderId(orderEntity.id);
    if (!payment)
        return;
    const booking = yield RazorpayWebhookRepository.findBookingByPaymentId(payment.id);
    return (0, exports.markPaymentAsFailed)({
        paymentId: payment.id,
        bookingId: booking === null || booking === void 0 ? void 0 : booking.id,
        cancellationReason: "User did not complete payment within time limit",
    });
});
