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
exports.logServiceProviderChanged = exports.logServiceProviderAssigned = void 0;
const logger_service_1 = require("../../services/logger.service");
const log_enum_1 = require("../../enums/log.enum");
const logServiceProviderAssigned = (_a) => __awaiter(void 0, [_a], void 0, function* ({ metadata, message, }) {
    yield (0, logger_service_1.logEvent)({
        eventType: log_enum_1.LogEventType.SERVICE_PROVIDER_ASSIGNED,
        category: log_enum_1.LogCategory.SERVICE_PROVIDER,
        message: message || "ServiceProvider assigned a partner",
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
exports.logServiceProviderAssigned = logServiceProviderAssigned;
const logServiceProviderChanged = (_a) => __awaiter(void 0, [_a], void 0, function* ({ bookingId, serviceId, message, userId, }) {
    yield (0, logger_service_1.logEvent)({
        eventType: log_enum_1.LogEventType.SERVICE_PROVIDER_CHANGED,
        category: log_enum_1.LogCategory.SERVICE_PROVIDER,
        message: message || "Service Provider changed",
        status: log_enum_1.LogStatus.SUCCESS,
        bookingId,
        serviceId,
        userId,
    });
});
exports.logServiceProviderChanged = logServiceProviderChanged;
