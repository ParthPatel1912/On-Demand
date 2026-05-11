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
exports.softDeleteOffer = exports.updateOffer = exports.updateOfferUsedCount = exports.findAllOffers = exports.findOfferByCouponCode = exports.findOfferByIdIncludingDeleted = exports.findOfferById = exports.createOffer = void 0;
const models_1 = require("../models");
const sequelize_1 = require("sequelize");
/**
 * Persists a new offer record.
 */
const createOffer = (data) => __awaiter(void 0, void 0, void 0, function* () {
    return yield models_1.Offer.create(data);
});
exports.createOffer = createOffer;
/**
 * Finds a single active offer by primary key.
 * Soft-deleted offers are excluded from this query.
 */
const findOfferById = (offerId) => __awaiter(void 0, void 0, void 0, function* () {
    return yield models_1.Offer.findByPk(offerId);
});
exports.findOfferById = findOfferById;
/**
 * Finds a single offer by primary key, including soft-deleted rows.
 * Use this only for read-only lookups where deleted offers must still be visible.
 */
const findOfferByIdIncludingDeleted = (offerId) => __awaiter(void 0, void 0, void 0, function* () {
    return yield models_1.Offer.findByPk(offerId, { paranoid: false });
});
exports.findOfferByIdIncludingDeleted = findOfferByIdIncludingDeleted;
/**
 * Finds a single offer by coupon code.
 */
const findOfferByCouponCode = (couponCode_1, ...args_1) => __awaiter(void 0, [couponCode_1, ...args_1], void 0, function* (couponCode, includeDeleted = false) {
    return yield models_1.Offer.findOne({
        where: { couponCode },
        paranoid: !includeDeleted,
    });
});
exports.findOfferByCouponCode = findOfferByCouponCode;
/**
 * Returns all offers with dynamic filtering and pagination support.
 */
const findAllOffers = (_a) => __awaiter(void 0, [_a], void 0, function* ({ isActive, page, per_page, discount, min_applied, max_applied, min_usage_limit, max_usage_limit, search, sort_by, sort_order, min_discount, max_discount, created_from, created_to, }) {
    const whereClause = {};
    if (isActive !== undefined) {
        whereClause.isActive = isActive;
    }
    if (search) {
        whereClause[sequelize_1.Op.or] = [
            { couponCode: { [sequelize_1.Op.iLike]: `%${search}%` } },
            { couponDescription: { [sequelize_1.Op.iLike]: `%${search}%` } },
        ];
    }
    if (discount !== undefined) {
        whereClause.discountPercentage = discount;
    }
    else if (min_discount !== undefined || max_discount !== undefined) {
        whereClause.discountPercentage = {};
        if (min_discount !== undefined) {
            whereClause.discountPercentage[sequelize_1.Op.gte] = min_discount;
        }
        if (max_discount !== undefined) {
            whereClause.discountPercentage[sequelize_1.Op.lte] = max_discount;
        }
    }
    if (min_applied !== undefined || max_applied !== undefined) {
        whereClause.usedCount = {};
        if (min_applied !== undefined) {
            whereClause.usedCount[sequelize_1.Op.gte] = min_applied;
        }
        if (max_applied !== undefined) {
            whereClause.usedCount[sequelize_1.Op.lte] = max_applied;
        }
    }
    if (min_usage_limit !== undefined || max_usage_limit !== undefined) {
        whereClause.maxUsage = {};
        if (min_usage_limit !== undefined) {
            whereClause.maxUsage[sequelize_1.Op.gte] = min_usage_limit;
        }
        if (max_usage_limit !== undefined) {
            whereClause.maxUsage[sequelize_1.Op.lte] = max_usage_limit;
        }
    }
    if (created_from || created_to) {
        whereClause.createdAt = {};
        if (created_from) {
            whereClause.createdAt[sequelize_1.Op.gte] = created_from;
        }
        if (created_to) {
            whereClause.createdAt[sequelize_1.Op.lte] = created_to;
        }
    }
    const limit = per_page ? Number(per_page) : undefined;
    const offset = page && limit ? (Number(page) - 1) * limit : undefined;
    const order = [];
    if (sort_by) {
        order.push([sort_by, sort_order || "DESC"]);
    }
    else {
        order.push(["createdAt", "DESC"]);
    }
    return yield models_1.Offer.findAndCountAll({
        where: whereClause,
        order,
        limit,
        offset,
    });
});
exports.findAllOffers = findAllOffers;
/**
 * Updates only the usage counter for an active offer instance.
 */
const updateOfferUsedCount = (offer, usedCount) => __awaiter(void 0, void 0, void 0, function* () {
    return yield offer.update({ usedCount });
});
exports.updateOfferUsedCount = updateOfferUsedCount;
/**
 * Updates editable fields on an active offer instance.
 */
const updateOffer = (offer, data) => __awaiter(void 0, void 0, void 0, function* () {
    return yield offer.update(data);
});
exports.updateOffer = updateOffer;
/**
 * Soft deletes an active offer instance.
 */
const softDeleteOffer = (offer) => __awaiter(void 0, void 0, void 0, function* () {
    return yield offer.destroy();
});
exports.softDeleteOffer = softDeleteOffer;
