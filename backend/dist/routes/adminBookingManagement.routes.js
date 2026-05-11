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
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const controller = __importStar(require("../controllers/adminBookingManagement.controller"));
const bookingManagementCache_util_1 = require("../utils/caching-utils/bookingManagementCache.util");
const rateLimit_middleware_1 = require("../middlewares/rateLimit.middleware");
const router = (0, express_1.Router)();
// Booking-management mutation rate limits (admin):
// - Key by authenticated user id when available (falls back to normalized IP).
// - Defaults can be overridden via env vars.
const bookingAdminUpdateRateLimiter = (0, rateLimit_middleware_1.createUserOrIpRateLimiter)("booking:update", {
    windowMs: (0, rateLimit_middleware_1.numberFromEnv)("RATE_LIMIT_BOOKING_UPDATE_WINDOW_MS", 60 * 1000),
    limit: (0, rateLimit_middleware_1.numberFromEnv)("RATE_LIMIT_BOOKING_UPDATE_MAX", 60),
});
const bookingAdminDeleteRateLimiter = (0, rateLimit_middleware_1.createUserOrIpRateLimiter)("booking:delete", {
    windowMs: (0, rateLimit_middleware_1.numberFromEnv)("RATE_LIMIT_BOOKING_DELETE_WINDOW_MS", 60 * 1000),
    limit: (0, rateLimit_middleware_1.numberFromEnv)("RATE_LIMIT_BOOKING_DELETE_MAX", 60),
});
/**
 * @name getExpertsByServiceType
 * @description Returns verified experts for a given service type name (cached).
 * @access Role-based
 */
router.get("/experts", auth_middleware_1.verifyJWT, auth_middleware_1.checkActiveUser, (0, bookingManagementCache_util_1.bookingManagementCache)(120), controller.getExpertsByServiceType);
/**
 * @name getBookingFilters
 * @description Returns booking filters used to initialize the admin booking UI (cached).
 * @access Role-based
 */
router.get("/filters", auth_middleware_1.verifyJWT, auth_middleware_1.checkActiveUser, (0, bookingManagementCache_util_1.bookingManagementCache)(120), controller.getBookingFilters);
/**
 * @name getAdminBookings
 * @description Returns paginated booking groups for admin with query-based filtering/sorting (cached).
 * @access Role-based
 */
router.get("/", auth_middleware_1.verifyJWT, auth_middleware_1.checkActiveUser, (0, bookingManagementCache_util_1.bookingManagementCache)(120), controller.getAdminBookings);
/**
 * @name updateBookingStatus
 * @description Updates a booking status (write endpoint; rate-limited; clears dependent caches).
 * @access Role-based
 */
router.patch("/:bookingId/status", auth_middleware_1.verifyJWT, auth_middleware_1.checkActiveUser, bookingAdminUpdateRateLimiter, controller.updateBookingStatus);
/**
 * @name changeBookingExpert
 * @description Reassigns the expert for a booking (write endpoint; rate-limited; clears dependent caches).
 * @access Role-based
 */
router.patch("/:bookingId/expert", auth_middleware_1.verifyJWT, auth_middleware_1.checkActiveUser, bookingAdminUpdateRateLimiter, controller.changeBookingExpert);
/**
 * @name deleteBooking
 * @description Deletes a booking record (write endpoint; rate-limited; clears dependent caches).
 * @access Role-based
 */
router.delete("/:bookingId", auth_middleware_1.verifyJWT, auth_middleware_1.checkActiveUser, bookingAdminDeleteRateLimiter, controller.deleteBooking);
/**
 * @name getAdminBookingDetailsPageData
 * @description Returns booking details + activity logs in a single request (partial data when one section fails).
 * @access Role-based
 */
router.get("/:bookingId/page-data", auth_middleware_1.verifyJWT, auth_middleware_1.checkActiveUser, controller.getAdminBookingDetailsPageData);
/**
 * @name getAdminBookingDetails
 * @description Returns admin booking details for a single booking id.
 * @access Role-based
 */
router.get("/:bookingId", auth_middleware_1.verifyJWT, auth_middleware_1.checkActiveUser, controller.getAdminBookingDetails);
exports.default = router;
