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
exports.getMyBookings = exports.getAvailabilitySlots = exports.downloadInvoice = exports.getBookingSuccessDetails = void 0;
const BookingService = __importStar(require("../services/booking.service"));
const logger_1 = __importDefault(require("../utils/logger"));
const pdf_util_1 = require("../utils/pdf.util");
const asyncErrorHandler_1 = __importDefault(require("../utils/asyncErrorHandler"));
const response_util_1 = require("../utils/response.util");
const enums_1 = require("../enums");
const messages_1 = require("../constants/messages");
const apiError_util_1 = require("../utils/apiError.util");
const common_utils_1 = require("../utils/common.utils");
/**
 * GET /bookings/:bookingId/success-details
 */
const getBookingSuccessDetails = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { bookingId } = req.params;
        logger_1.default.info(`BookingController: Get success details for booking ${bookingId}`);
        if (!bookingId)
            throw new apiError_util_1.ApiError(enums_1.STATUS_CODE.BAD_REQUEST, messages_1.MESSAGES.BOOKING.ID_REQUIRED);
        const data = yield BookingService.getBookingSuccessDetails(Number(bookingId));
        return (0, response_util_1.sendResponse)(res, messages_1.MESSAGES.BOOKING.SUCCESS_DETAILS_FETCHED, data);
    }
    catch (error) {
        logger_1.default.error(`BookingController: Error fetching success details: ${error.message}`);
        next(error);
    }
});
exports.getBookingSuccessDetails = getBookingSuccessDetails;
/**
 * GET /bookings/invoice/:invoiceNumber
 */
const downloadInvoice = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { invoiceNumber } = req.params;
        logger_1.default.info(`BookingController: Download invoice ${invoiceNumber}`);
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.sub;
        if (!userId)
            throw new apiError_util_1.ApiError(enums_1.STATUS_CODE.UNAUTHORIZED, messages_1.MESSAGES.COMMON.UNAUTHORIZED);
        const data = yield BookingService.getInvoiceData(invoiceNumber, +userId);
        // Set response headers for PDF download
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", `attachment; filename="${invoiceNumber}.pdf"`);
        // Generate and stream the PDF directly to the response
        (0, pdf_util_1.generateInvoicePDF)(data, res);
    }
    catch (error) {
        logger_1.default.error(`BookingController: Error downloading invoice: ${error.message}`);
        next(error);
    }
});
exports.downloadInvoice = downloadInvoice;
exports.getAvailabilitySlots = (0, asyncErrorHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { serviceId } = req.params;
    logger_1.default.info(`BookingController: Get availability slots for service ${serviceId}`);
    if (!serviceId)
        throw new apiError_util_1.ApiError(enums_1.STATUS_CODE.BAD_REQUEST, messages_1.MESSAGES.SERVICE.ID_REQUIRED);
    const data = yield BookingService.getAvailabilitySlotsByService(Number(serviceId));
    return (0, response_util_1.sendResponse)(res, messages_1.MESSAGES.SERVICE.SLOTS_FETCHED, data);
}));
/**
 * @name getMyBookings
 * @description Fetch logged-in customer's bookings based on tab filter.
 * @access Private (Requires Authentication)
 * @queryParam tab - upcoming | completed (default: upcoming)
 */
const getMyBookings = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId, tab, page, limit } = req.body || {};
        if (!userId) {
            throw new apiError_util_1.ApiError(enums_1.STATUS_CODE.UNAUTHORIZED, messages_1.MESSAGES.BOOKING.USER_ID_REQUIRED);
        }
        const bookings = yield BookingService.getMyBookings(Number(userId), tab || undefined, Number(page) || 1, Number(limit) || 10);
        return (0, response_util_1.sendResponse)(res, messages_1.MESSAGES.BOOKING.FETCHED, bookings);
    }
    catch (error) {
        logger_1.default.error(`BookingController:getMyBookings error: ${(0, common_utils_1.getErrorMessage)(error)}`);
        next(error);
    }
});
exports.getMyBookings = getMyBookings;
