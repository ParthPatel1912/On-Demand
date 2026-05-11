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
exports.createCouponUsage = exports.checkCouponUsage = void 0;
const couponUsage_model_1 = __importDefault(require("../models/couponUsage.model"));
const apiError_util_1 = require("../utils/apiError.util");
const logger_1 = __importDefault(require("../utils/logger"));
const messages_1 = require("../constants/messages");
const enums_1 = require("../enums");
const serviceBookingCheckout_repository_1 = require("../repositories/serviceBookingCheckout.repository");
const offer_service_1 = require("./offer.service");
/**
 * Check if coupon/offer is used by user
 */
const checkCouponUsage = (offerId, userId) => __awaiter(void 0, void 0, void 0, function* () {
    logger_1.default.info(`CouponUsageService: Checking usage for offer ${offerId}, user ${userId}`);
    if (!userId) {
        throw new apiError_util_1.ApiError(enums_1.STATUS_CODE.NOT_FOUND, messages_1.MESSAGES.CUSTOMER.AUTH_REQUIRED_FOR_COUPON);
    }
    const offer = yield (0, serviceBookingCheckout_repository_1.findOfferById)(parseInt(offerId, 10));
    if (!offer) {
        throw new apiError_util_1.ApiError(enums_1.STATUS_CODE.NOT_FOUND, messages_1.MESSAGES.CUSTOMER.COUPON_NOT_FOUND);
    }
    if (!offer.isActive) {
        throw new apiError_util_1.ApiError(enums_1.STATUS_CODE.NOT_FOUND, messages_1.MESSAGES.CUSTOMER.COUPON_INACTIVE);
    }
    if (offer.usedCount >= offer.maxUsage) {
        throw new apiError_util_1.ApiError(enums_1.STATUS_CODE.NOT_FOUND, messages_1.MESSAGES.CUSTOMER.COUPON_MAX_USAGE_REACHED);
    }
    const usage = yield couponUsage_model_1.default.findOne({
        where: {
            offerId: parseInt(offerId, 10),
            userId: parseInt(userId, 10),
        },
    });
    if (usage) {
        throw new apiError_util_1.ApiError(enums_1.STATUS_CODE.NOT_FOUND, messages_1.MESSAGES.CUSTOMER.COUPON_ALREADY_USED);
    }
    return {
        success: true,
        message: messages_1.MESSAGES.CUSTOMER.COUPON_APPLIED_SUCCESSFULLY,
    };
});
exports.checkCouponUsage = checkCouponUsage;
const createCouponUsage = (offerId, userId) => __awaiter(void 0, void 0, void 0, function* () {
    logger_1.default.info(`CouponUsageService: Creating usage for offer ${offerId}, user ${userId}`);
    if (!userId) {
        throw new apiError_util_1.ApiError(enums_1.STATUS_CODE.NOT_FOUND, messages_1.MESSAGES.CUSTOMER.AUTH_REQUIRED_FOR_COUPON);
    }
    const numericOfferId = Number(offerId);
    const numericUserId = Number(userId);
    // Validate numeric conversion
    if (!Number.isFinite(numericOfferId) || !Number.isFinite(numericUserId)) {
        throw new apiError_util_1.ApiError(enums_1.STATUS_CODE.BAD_REQUEST, messages_1.MESSAGES.CUSTOMER.INVALID_INPUT);
    }
    yield (0, exports.checkCouponUsage)(offerId, userId);
    const usage = yield couponUsage_model_1.default.create({
        offerId: numericOfferId,
        userId: numericUserId,
        createdAt: new Date(),
        updatedAt: new Date(),
    });
    // Increment offer used count outside the transaction to reduce lock time
    if (!usage) {
        throw new apiError_util_1.ApiError(enums_1.STATUS_CODE.NOT_FOUND, messages_1.MESSAGES.CUSTOMER.COUPON_APPLIED_FAILED);
    }
    yield (0, offer_service_1.updateOfferUsedCountService)(numericOfferId);
    return {
        success: true,
        message: messages_1.MESSAGES.CUSTOMER.COUPON_APPLIED_SUCCESSFULLY,
    };
});
exports.createCouponUsage = createCouponUsage;
