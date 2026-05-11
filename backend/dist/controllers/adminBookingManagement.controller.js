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
exports.getAdminBookingDetailsPageData = exports.getAdminBookingDetails = exports.getBookingFilters = exports.getExpertsByServiceType = exports.changeBookingExpert = exports.deleteBooking = exports.updateBookingStatus = exports.getAdminBookings = void 0;
const logger_1 = __importDefault(require("../utils/logger"));
const service = __importStar(require("../services/adminBookingManagement.service"));
const detailsService = __importStar(require("../services/adminBookingDetailsPage.service"));
const bookingManagementCache_util_1 = require("../utils/caching-utils/bookingManagementCache.util");
const dashboardCache_util_1 = require("../utils/caching-utils/dashboardCache.util");
const response_util_1 = require("../utils/response.util");
const common_utils_1 = require("../utils/common.utils");
const messages_1 = require("../constants/messages");
const getAdminBookings = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // For GET endpoints, apicache short-circuits the handler on cache hits.
        logger_1.default.info("AdminBookingManagementController: list bookings");
        const result = yield service.getAdminBookings(req.query);
        return (0, response_util_1.sendResponse)(res, {
            data: result.rows,
            pagination: result.pagination,
        });
    }
    catch (error) {
        logger_1.default.error(`AdminBookingManagementController:getAdminBookings error: ${(0, common_utils_1.getErrorMessage)(error)}`);
        next(error);
    }
});
exports.getAdminBookings = getAdminBookings;
const updateBookingStatus = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        // Writes must clear any dependent caches (booking-management list + dashboard KPIs).
        const bookingId = Number(req.params.bookingId);
        const { status, cancellationReason } = req.body || {};
        const userId = ((_a = req.user) === null || _a === void 0 ? void 0 : _a.id) || ((_b = req.user) === null || _b === void 0 ? void 0 : _b.sub);
        logger_1.default.info(`AdminBookingManagementController:updateBookingStatus bookingId=${bookingId} status=${status} cancellationReason=${cancellationReason}`);
        yield service.updateBookingStatus(bookingId, Number(userId), status, cancellationReason);
        (0, bookingManagementCache_util_1.clearBookingManagementCache)();
        (0, dashboardCache_util_1.clearDashboardCache)();
        return (0, response_util_1.sendResponse)(res, messages_1.MESSAGES.BOOKING.STATUS_UPDATED);
    }
    catch (error) {
        logger_1.default.error(`AdminBookingManagementController:updateBookingStatus error: ${(0, common_utils_1.getErrorMessage)(error)}`);
        next(error);
    }
});
exports.updateBookingStatus = updateBookingStatus;
const deleteBooking = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const bookingId = Number(req.params.bookingId);
        logger_1.default.info(`AdminBookingManagementController:deleteBooking bookingId=${bookingId}`);
        yield service.deleteBooking(bookingId);
        (0, bookingManagementCache_util_1.clearBookingManagementCache)();
        (0, dashboardCache_util_1.clearDashboardCache)();
        return (0, response_util_1.sendResponse)(res, messages_1.MESSAGES.BOOKING.DELETED);
    }
    catch (error) {
        logger_1.default.error(`AdminBookingManagementController:deleteBooking error: ${(0, common_utils_1.getErrorMessage)(error)}`);
        next(error);
    }
});
exports.deleteBooking = deleteBooking;
const changeBookingExpert = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const bookingId = Number(req.params.bookingId);
        const { servicePartnerId } = req.body || {};
        logger_1.default.info(`AdminBookingManagementController:changeBookingExpert bookingId=${bookingId} servicePartnerId=${servicePartnerId}`);
        yield service.changeBookingExpert(bookingId, Number(servicePartnerId), (_a = req.user) === null || _a === void 0 ? void 0 : _a.id);
        (0, bookingManagementCache_util_1.clearBookingManagementCache)();
        (0, dashboardCache_util_1.clearDashboardCache)();
        return (0, response_util_1.sendResponse)(res, messages_1.MESSAGES.BOOKING.EXPERT_ASSIGNED);
    }
    catch (error) {
        logger_1.default.error(`AdminBookingManagementController:changeBookingExpert error: ${(0, common_utils_1.getErrorMessage)(error)}`);
        next(error);
    }
});
exports.changeBookingExpert = changeBookingExpert;
const getExpertsByServiceType = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    try {
        const query = req.query;
        const pickFirstString = (value) => typeof value === "string"
            ? value
            : Array.isArray(value) && typeof value[0] === "string"
                ? value[0]
                : undefined;
        const serviceType = String((_c = (_b = (_a = pickFirstString(query.serviceType)) !== null && _a !== void 0 ? _a : pickFirstString(query.service_type)) !== null && _b !== void 0 ? _b : pickFirstString(query.serviceTypeName)) !== null && _c !== void 0 ? _c : "").trim();
        logger_1.default.info(`AdminBookingManagementController:getExpertsByServiceType serviceType=${serviceType}`);
        const experts = yield service.getVerifiedExpertsByServiceTypeName(serviceType);
        return (0, response_util_1.sendResponse)(res, messages_1.MESSAGES.EXPERT.EXPERT_FETCHED, experts);
    }
    catch (error) {
        logger_1.default.error(`AdminBookingManagementController:getExpertsByServiceType error: ${(0, common_utils_1.getErrorMessage)(error)}`);
        next(error);
    }
});
exports.getExpertsByServiceType = getExpertsByServiceType;
const getBookingFilters = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        logger_1.default.info("AdminBookingManagementController:getBookingFilters");
        const filters = yield service.getAdminBookingFilters();
        return (0, response_util_1.sendResponse)(res, messages_1.MESSAGES.BOOKING.FILTERS_FETCHED, filters);
    }
    catch (error) {
        logger_1.default.error(`AdminBookingManagementController:getBookingFilters error: ${(0, common_utils_1.getErrorMessage)(error)}`);
        next(error);
    }
});
exports.getBookingFilters = getBookingFilters;
const getAdminBookingDetails = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const bookingId = Number(req.params.bookingId);
        logger_1.default.info(`AdminBookingManagementController:getAdminBookingDetails bookingId=${bookingId}`);
        const details = yield detailsService.getAdminBookingDetails(bookingId);
        return (0, response_util_1.sendResponse)(res, messages_1.MESSAGES.BOOKING.FETCHED_WITH_PAYMENT_DETAILS, details);
    }
    catch (error) {
        logger_1.default.error(`AdminBookingManagementController:getAdminBookingDetails error: ${(0, common_utils_1.getErrorMessage)(error)}`);
        next(error);
    }
});
exports.getAdminBookingDetails = getAdminBookingDetails;
const getAdminBookingDetailsPageData = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const bookingId = Number(req.params.bookingId);
        const query = req.query;
        logger_1.default.info(`AdminBookingManagementController:getAdminBookingDetailsPageData bookingId=${bookingId} query=${JSON.stringify(query)}`);
        const pageData = yield detailsService.getAdminBookingDetailsPageData({
            bookingId,
            page: query.page,
            limit: query.limit,
            sortBy: query.sortBy,
            sortOrder: query.sortOrder,
        });
        return (0, response_util_1.sendResponse)(res, {
            data: pageData.data,
            errors: pageData.errors,
            message: messages_1.MESSAGES.BOOKING.FETCHED_WITH_PAYMENT_DETAILS,
        });
    }
    catch (error) {
        logger_1.default.error(`AdminBookingManagementController:getAdminBookingDetailsPageData error: ${(0, common_utils_1.getErrorMessage)(error)}`);
        next(error);
    }
});
exports.getAdminBookingDetailsPageData = getAdminBookingDetailsPageData;
