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
const BookingController = __importStar(require("../controllers/booking.controller"));
const auth_middleware_1 = require("../middlewares/auth.middleware");
/**
 * Booking Routes
 * Base path: /api/bookings
 */
const router = (0, express_1.Router)();
/**
 * @swagger
 * tags:
 *   name: Bookings
 *   description: Booking management for customers.
 */
//Get My Upcoming and Completed Booking Service 
/**
 * @swagger
 * /api/bookings/my-bookings:
 *   post:
 *     summary: Get logged-in customer's bookings
 *     tags: [Bookings]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: integer
 *               tab:
 *                 type: string
 *                 enum: [upcoming, completed]
 *               page:
 *                 type: integer
 *               limit:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Bookings retrieved successfully
 */
router.post("/my-bookings", auth_middleware_1.verifyJWT, auth_middleware_1.checkActiveUser, BookingController.getMyBookings);
// Download booking invoice
/**
 * @swagger
 * /api/bookings/invoice/{invoiceNumber}:
 *   get:
 *     summary: Download booking invoice PDF
 *     tags: [Bookings]
 *     parameters:
 *       - in: path
 *         name: invoiceNumber
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Invoice PDF downloaded successfully
 */
router.get("/invoice/:invoiceNumber", auth_middleware_1.verifyJWT, auth_middleware_1.checkActiveUser, BookingController.downloadInvoice);
// Get booking success details and perform partner assignment
/**
 * @swagger
 * /api/bookings/{bookingId}/success-details:
 *   get:
 *     summary: Get booking success details
 *     tags: [Bookings]
 *     parameters:
 *       - in: path
 *         name: bookingId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Booking details retrieved successfully
 */
router.get("/:bookingId/success-details", auth_middleware_1.verifyJWT, auth_middleware_1.checkActiveUser, BookingController.getBookingSuccessDetails);
// Get disabled slots for a services
/**
 * @swagger
 * /api/bookings/{serviceId}/available-slots:
 *   get:
 *     summary: Get available slots for a service
 *     tags: [Bookings]
 *     parameters:
 *       - in: path
 *         name: serviceId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Slots retrieved successfully
 */
router.get("/:serviceId/available-slots", BookingController.getAvailabilitySlots);
exports.default = router;
