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
exports.convertObjToCamelCase = exports.updateOfferUsedCountService = exports.deleteOfferService = exports.updateOfferService = exports.getOfferService = exports.getOffersService = exports.createOfferService = void 0;
const constants_1 = require("../constants");
const messages_1 = require("../constants/messages");
const enums_1 = require("../enums");
const offer_repository_1 = require("../repositories/offer.repository");
const apiError_util_1 = require("../utils/apiError.util");
/**
 * Converts an Offer model into a plain response DTO so controllers return a
 * stable API shape instead of raw Sequelize instances.
 */
const toOfferResponseDto = (offer) => {
    var _a, _b, _c, _d;
    return ({
        id: Number(offer.id),
        coupon_code: offer.couponCode,
        coupon_description: (_a = offer.couponDescription) !== null && _a !== void 0 ? _a : null,
        discount_percentage: Number(offer.discountPercentage),
        discount_percentage_text: offer.discountPercentage ? `${Number(offer.discountPercentage).toFixed(0)}%` : "0%",
        max_usage: Number((_b = offer.maxUsage) !== null && _b !== void 0 ? _b : 0),
        used_count: Number((_c = offer.usedCount) !== null && _c !== void 0 ? _c : 0),
        times_applied: Number((_d = offer.usedCount) !== null && _d !== void 0 ? _d : 0),
        times_applied_text: offer.usedCount ? `${offer.usedCount} times` : "0 times",
        is_active: Boolean(offer.isActive),
        status_label: offer.isActive ? "Active" : "Inactive"
    });
};
/**
 * Normalizes the optional `isActive` query parameter so the list endpoint can
 * accept common boolean-like string values from query strings.
 */
const parseIsActiveFilter = (isActive) => {
    if (typeof isActive === "boolean") {
        return isActive;
    }
    if (typeof isActive !== "string") {
        return undefined;
    }
    const normalizedIsActive = isActive.trim().toLowerCase();
    if (["true", "1", "yes", "active"].includes(normalizedIsActive)) {
        return true;
    }
    if (["false", "0", "no", "inactive"].includes(normalizedIsActive)) {
        return false;
    }
    return undefined;
};
/**
 * Creates a new offer after normalizing the coupon code and checking for
 * duplicates.
 */
const createOfferService = (body) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    const couponCode = body.couponCode.trim().toUpperCase();
    const existingOffer = yield (0, offer_repository_1.findOfferByCouponCode)(couponCode);
    if (existingOffer) {
        throw new apiError_util_1.ApiError(enums_1.STATUS_CODE.CONFLICT, messages_1.MESSAGES.OFFER.COUPON_CODE_EXISTS);
    }
    const offer = yield (0, offer_repository_1.createOffer)({
        couponCode: couponCode,
        couponDescription: ((_a = body.couponDescription) === null || _a === void 0 ? void 0 : _a.trim()) || null,
        discountPercentage: body.discountPercentage,
        maxUsage: (_b = body.maxUsage) !== null && _b !== void 0 ? _b : 0,
        usedCount: (_c = body.usedCount) !== null && _c !== void 0 ? _c : 0,
    });
    return toOfferResponseDto(offer);
});
exports.createOfferService = createOfferService;
/**
 * Returns all offers, optionally filtered and paginated.
 */
const getOffersService = (query) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const safePage = Math.max(1, Number(query.page) || 1);
    const safeLimit = Math.max(1, Math.min(100, Number(query.per_page) || 10));
    const filters = {
        isActive: parseIsActiveFilter(query.status),
        page: safePage,
        per_page: safeLimit,
        discount: query.discount ? Number(query.discount) : undefined,
        min_applied: query.min_applied ? Number(query.min_applied) : undefined,
        max_applied: query.max_applied ? Number(query.max_applied) : undefined,
        min_usage_limit: query.min_usage_limit ? Number(query.min_usage_limit) : undefined,
        max_usage_limit: query.max_usage_limit ? Number(query.max_usage_limit) : undefined,
        search: (_a = query.search) === null || _a === void 0 ? void 0 : _a.trim(),
        sort_by: query.sort_by,
        sort_order: (((_b = query.sort_order) === null || _b === void 0 ? void 0 : _b.toUpperCase()) === constants_1.SORT_ORDER.ASC ? constants_1.SORT_ORDER.ASC : constants_1.SORT_ORDER.DESC),
        min_discount: query.min_discount ? Number(query.min_discount) : undefined,
        max_discount: query.max_discount ? Number(query.max_discount) : undefined,
        created_from: query.created_from ? new Date(query.created_from) : undefined,
        created_to: query.created_to ? new Date(query.created_to) : undefined,
    };
    const { rows, count } = yield (0, offer_repository_1.findAllOffers)(filters);
    if (!rows.length) {
        throw new apiError_util_1.ApiError(enums_1.STATUS_CODE.NOT_FOUND, messages_1.MESSAGES.OFFER.NOT_FOUND);
    }
    const offers = rows.map(toOfferResponseDto);
    return {
        data: offers,
        pagination: {
            totalItems: count,
            totalPages: Math.ceil(count / safeLimit),
            currentPage: safePage,
            limit: safeLimit,
        },
    };
});
exports.getOffersService = getOffersService;
/**
 * Returns a single offer by its id, including soft-deleted offers when the
 * caller requests a direct lookup by identifier.
 */
const getOfferService = (offerId) => __awaiter(void 0, void 0, void 0, function* () {
    if (!offerId) {
        throw new apiError_util_1.ApiError(enums_1.STATUS_CODE.BAD_REQUEST, messages_1.MESSAGES.OFFER.REQUIRED_OFFER_ID);
    }
    const offer = yield (0, offer_repository_1.findOfferById)(offerId);
    if (!offer) {
        throw new apiError_util_1.ApiError(enums_1.STATUS_CODE.NOT_FOUND, messages_1.MESSAGES.OFFER.NOT_FOUND_OFFER);
    }
    return toOfferResponseDto(offer);
});
exports.getOfferService = getOfferService;
/**
 * Updates editable offer fields, including active status, while preserving
 * coupon uniqueness among non-deleted offers.
 */
const updateOfferService = (offerId, body) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e;
    if (!offerId) {
        throw new apiError_util_1.ApiError(enums_1.STATUS_CODE.BAD_REQUEST, messages_1.MESSAGES.OFFER.REQUIRED_OFFER_ID);
    }
    const offer = yield (0, offer_repository_1.findOfferById)(offerId);
    if (!offer) {
        throw new apiError_util_1.ApiError(enums_1.STATUS_CODE.NOT_FOUND, messages_1.MESSAGES.OFFER.NOT_FOUND_OFFER);
    }
    const nextCouponCode = body.couponCode !== undefined
        ? body.couponCode.trim().toUpperCase()
        : offer.couponCode;
    if (nextCouponCode !== offer.couponCode) {
        const existingOffer = yield (0, offer_repository_1.findOfferByCouponCode)(nextCouponCode);
        if (existingOffer && Number(existingOffer.id) !== Number(offer.id)) {
            throw new apiError_util_1.ApiError(enums_1.STATUS_CODE.CONFLICT, messages_1.MESSAGES.OFFER.COUPON_CODE_EXISTS);
        }
    }
    const nextMaxUsage = (_a = body.maxUsage) !== null && _a !== void 0 ? _a : Number((_b = offer.maxUsage) !== null && _b !== void 0 ? _b : 0);
    const nextUsedCount = (_c = body.usedCount) !== null && _c !== void 0 ? _c : Number((_d = offer.usedCount) !== null && _d !== void 0 ? _d : 0);
    if (nextMaxUsage > 0 && nextUsedCount > nextMaxUsage) {
        throw new apiError_util_1.ApiError(enums_1.STATUS_CODE.BAD_REQUEST, messages_1.MESSAGES.OFFER.USED_COUNT_EXCEEDS_MAX_USAGE);
    }
    const payload = {};
    if (body.couponCode !== undefined) {
        payload.couponCode = nextCouponCode;
    }
    if (body.couponDescription !== undefined) {
        payload.couponDescription = ((_e = body.couponDescription) === null || _e === void 0 ? void 0 : _e.trim()) || null;
    }
    if (body.discountPercentage !== undefined) {
        payload.discountPercentage = body.discountPercentage;
    }
    if (body.maxUsage !== undefined) {
        payload.maxUsage = body.maxUsage;
    }
    if (body.usedCount !== undefined) {
        payload.usedCount = body.usedCount;
    }
    if (body.isActive !== undefined) {
        payload.isActive = body.isActive;
    }
    yield (0, offer_repository_1.updateOffer)(offer, payload);
    return toOfferResponseDto(offer);
});
exports.updateOfferService = updateOfferService;
/**
 * Soft deletes an offer so it is hidden from standard list queries while still
 * remaining available for direct lookups when needed.
 */
const deleteOfferService = (offerId) => __awaiter(void 0, void 0, void 0, function* () {
    if (!offerId) {
        throw new apiError_util_1.ApiError(enums_1.STATUS_CODE.BAD_REQUEST, messages_1.MESSAGES.OFFER.REQUIRED_OFFER_ID);
    }
    const offer = yield (0, offer_repository_1.findOfferById)(offerId);
    if (!offer) {
        throw new apiError_util_1.ApiError(enums_1.STATUS_CODE.NOT_FOUND, messages_1.MESSAGES.OFFER.NOT_FOUND_OFFER);
    }
    yield (0, offer_repository_1.softDeleteOffer)(offer);
});
exports.deleteOfferService = deleteOfferService;
/**
 * Updates only the `usedCount` field while ensuring the new value does not
 * exceed the configured maximum usage limit.
 */
const updateOfferUsedCountService = (offerId) => __awaiter(void 0, void 0, void 0, function* () {
    if (!offerId) {
        throw new apiError_util_1.ApiError(enums_1.STATUS_CODE.BAD_REQUEST, messages_1.MESSAGES.OFFER.REQUIRED_OFFER_ID);
    }
    const offer = yield (0, offer_repository_1.findOfferById)(offerId);
    if (!offer) {
        throw new apiError_util_1.ApiError(enums_1.STATUS_CODE.NOT_FOUND, messages_1.MESSAGES.OFFER.NOT_FOUND_OFFER);
    }
    const updatedUsedCount = offer.usedCount + 1;
    if (offer.maxUsage >= 0 && updatedUsedCount > offer.maxUsage) {
        throw new apiError_util_1.ApiError(enums_1.STATUS_CODE.BAD_REQUEST, messages_1.MESSAGES.OFFER.USED_COUNT_EXCEEDS_MAX_USAGE);
    }
    yield (0, offer_repository_1.updateOfferUsedCount)(offer, updatedUsedCount);
    return toOfferResponseDto(offer);
});
exports.updateOfferUsedCountService = updateOfferUsedCountService;
const convertObjToCamelCase = (obj) => {
    return Object.keys(obj).reduce((acc, key) => {
        const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
        acc[camelKey] = obj[key];
        return acc;
    }, {});
};
exports.convertObjToCamelCase = convertObjToCamelCase;
