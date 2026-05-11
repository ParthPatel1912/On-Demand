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
exports.deleteOffer = exports.updateOfferUsedCount = exports.updateOffer = exports.createOffer = exports.getOffer = exports.getOffers = void 0;
const response_util_1 = require("../utils/response.util");
const asyncErrorHandler_1 = __importDefault(require("../utils/asyncErrorHandler"));
const messages_1 = require("../constants/messages");
const enums_1 = require("../enums");
const offer_service_1 = require("../services/offer.service");
/**
 * Route: GET /offers
 * Returns the offer list, optionally filtered and paginated.
 */
exports.getOffers = (0, asyncErrorHandler_1.default)((req, res, _next) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield (0, offer_service_1.getOffersService)(req.query);
    return (0, response_util_1.sendResponse)(res, Object.assign({ message: messages_1.MESSAGES.OFFER.FETCHED }, result));
}));
/**
 * Route: GET /offers/:offerId
 * Returns a single offer by id.
 */
exports.getOffer = (0, asyncErrorHandler_1.default)((req, res, _next) => __awaiter(void 0, void 0, void 0, function* () {
    const offer = yield (0, offer_service_1.getOfferService)(Number(req.params.offerId));
    const message = offer.is_deleted
        ? messages_1.MESSAGES.OFFER.NO_LONGER_AVAILABLE
        : messages_1.MESSAGES.OFFER.FETCHED;
    return (0, response_util_1.sendResponse)(res, message, offer);
}));
/**
 * Route: POST /offers
 * Creates a new offer from the validated request body.
 */
exports.createOffer = (0, asyncErrorHandler_1.default)((req, res, _next) => __awaiter(void 0, void 0, void 0, function* () {
    const body = (0, offer_service_1.convertObjToCamelCase)(req.body);
    const offer = yield (0, offer_service_1.createOfferService)(body);
    return (0, response_util_1.sendResponse)(res, messages_1.MESSAGES.OFFER.CREATED, offer, enums_1.STATUS_CODE.CREATED);
}));
/**
 * Route: PUT /offers/:offerId
 * Updates offer fields, including `isActive`.
 */
exports.updateOffer = (0, asyncErrorHandler_1.default)((req, res, _next) => __awaiter(void 0, void 0, void 0, function* () {
    const body = (0, offer_service_1.convertObjToCamelCase)(req.body);
    const offer = yield (0, offer_service_1.updateOfferService)(Number(req.params.offerId), body);
    return (0, response_util_1.sendResponse)(res, messages_1.MESSAGES.OFFER.UPDATED, offer);
}));
/**
 * Route: PATCH /offers/:offerId/used-count
 * Updates only the `usedCount` field for a single offer.
 */
exports.updateOfferUsedCount = (0, asyncErrorHandler_1.default)((req, res, _next) => __awaiter(void 0, void 0, void 0, function* () {
    const offer = yield (0, offer_service_1.updateOfferUsedCountService)(Number(req.params.offerId));
    return (0, response_util_1.sendResponse)(res, messages_1.MESSAGES.OFFER.USED_COUNT_UPDATED, offer);
}));
/**
 * Route: DELETE /offers/:offerId
 * Soft deletes an offer.
 */
exports.deleteOffer = (0, asyncErrorHandler_1.default)((req, res, _next) => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, offer_service_1.deleteOfferService)(Number(req.params.offerId));
    return (0, response_util_1.sendResponse)(res, messages_1.MESSAGES.OFFER.DELETED);
}));
