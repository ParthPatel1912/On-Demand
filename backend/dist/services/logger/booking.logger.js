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
exports.logBookingStatusChanged = exports.logBookingBlocked = exports.logBookingInitiated = void 0;
const log_enum_1 = require("../../enums/log.enum");
const logger_service_1 = require("../logger.service");
const logBookingInitiated = (_a) => __awaiter(void 0, [_a], void 0, function* ({ metadata, message, }) {
    yield (0, logger_service_1.logEvent)({
        eventType: log_enum_1.LogEventType.BOOK_SERVICE_CLICK,
        category: log_enum_1.LogCategory.BOOKING,
        message: message || "Booking initiated",
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
exports.logBookingInitiated = logBookingInitiated;
const logBookingBlocked = (_a) => __awaiter(void 0, [_a], void 0, function* ({ metadata, message, }) {
    yield (0, logger_service_1.logEvent)({
        eventType: log_enum_1.LogEventType.BOOKING_SERVICE_BLOCK,
        category: log_enum_1.LogCategory.BOOKING,
        message: message || "Booking blocked for few minutes",
        userId: metadata.userId,
        serviceId: metadata.serviceId,
        status: log_enum_1.LogStatus.SUCCESS,
        metadata: {
            amount: metadata.amount,
            paymentMethod: metadata.paymentMethod,
            paymentGateway: metadata.paymentGateway,
        },
    });
});
exports.logBookingBlocked = logBookingBlocked;
const logBookingStatusChanged = (_a) => __awaiter(void 0, [_a], void 0, function* ({ bookingId, userId, serviceId, oldStatus, newStatus, message, }) {
    yield (0, logger_service_1.logEvent)({
        eventType: log_enum_1.LogEventType.BOOKING_STATUS_CHANGED,
        category: log_enum_1.LogCategory.BOOKING,
        bookingId: bookingId,
        message: message ||
            `Booking status changed from ${oldStatus || "UNKNOWN"} to ${newStatus}`,
        userId,
        serviceId,
        status: log_enum_1.LogStatus.SUCCESS,
        metadata: {
            bookingId,
            oldStatus,
            newStatus,
        },
    });
});
exports.logBookingStatusChanged = logBookingStatusChanged;
