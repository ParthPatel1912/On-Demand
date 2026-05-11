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
Object.defineProperty(exports, "__esModule", { value: true });
exports.logPaymentRefundFailed = exports.logPaymentRefunded = exports.logPaymentFailed = exports.logPaymentSuccess = exports.logPaymentInitiated = void 0;
const logger_service_1 = require("../../services/logger.service");
const log_enum_1 = require("../../enums/log.enum");
const logPaymentInitiated = (_a) => __awaiter(void 0, [_a], void 0, function* ({ metadata, message, }) {
    yield (0, logger_service_1.logEvent)({
        eventType: log_enum_1.LogEventType.PAYMENT_INITIATED,
        category: log_enum_1.LogCategory.PAYMENT,
        message: message || "Payment initiated",
        userId: metadata.userId,
        serviceId: metadata.serviceId,
        status: log_enum_1.LogStatus.INITIATED,
        metadata: {
            amount: metadata.amount,
            paymentMethod: metadata.paymentMethod,
            paymentGateway: metadata.paymentGateway,
        },
    });
});
exports.logPaymentInitiated = logPaymentInitiated;
const logPaymentSuccess = (_a) => __awaiter(void 0, [_a], void 0, function* ({ bookingId, message, metadata, }) {
    yield (0, logger_service_1.logEvent)({
        eventType: log_enum_1.LogEventType.PAYMENT_SUCCESS,
        category: log_enum_1.LogCategory.PAYMENT,
        message: message || "Payment successful",
        serviceId: metadata.serviceId,
        userId: metadata.userId,
        bookingId: bookingId,
        status: log_enum_1.LogStatus.SUCCESS,
        metadata: Object.assign({}, metadata),
    });
});
exports.logPaymentSuccess = logPaymentSuccess;
const logPaymentFailed = (_a) => __awaiter(void 0, [_a], void 0, function* ({ bookingId, metadata, message, }) {
    yield (0, logger_service_1.logEvent)({
        eventType: log_enum_1.LogEventType.PAYMENT_FAILED,
        category: log_enum_1.LogCategory.PAYMENT,
        message: message || "Payment failed",
        serviceId: metadata.serviceId,
        userId: metadata.userId,
        bookingId,
        status: log_enum_1.LogStatus.FAILED,
        metadata: Object.assign({}, metadata),
    });
});
exports.logPaymentFailed = logPaymentFailed;
const logPaymentRefunded = (_a) => __awaiter(void 0, [_a], void 0, function* ({ bookingId, message, metadata, }) {
    yield (0, logger_service_1.logEvent)({
        eventType: log_enum_1.LogEventType.PAYMENT_REFUNDED,
        category: log_enum_1.LogCategory.PAYMENT,
        message: message || "Payment refunded",
        serviceId: metadata.serviceId,
        userId: metadata.userId,
        bookingId,
        status: log_enum_1.LogStatus.SUCCESS,
        metadata: Object.assign({}, metadata),
    });
});
exports.logPaymentRefunded = logPaymentRefunded;
const logPaymentRefundFailed = (_a) => __awaiter(void 0, [_a], void 0, function* ({ bookingId, message, metadata, }) {
    yield (0, logger_service_1.logEvent)({
        eventType: log_enum_1.LogEventType.PAYMENT_REFUNDED_FAILED,
        category: log_enum_1.LogCategory.PAYMENT,
        message: message || "Payment refund failed",
        serviceId: metadata.serviceId,
        userId: metadata.userId,
        bookingId,
        status: log_enum_1.LogStatus.FAILED,
        metadata: Object.assign({}, metadata),
    });
});
exports.logPaymentRefundFailed = logPaymentRefundFailed;
