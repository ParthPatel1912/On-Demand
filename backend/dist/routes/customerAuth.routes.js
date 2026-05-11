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
const CustomerAuthController = __importStar(require("../controllers/customerAuth.controller"));
const validate_middleware_1 = require("../middlewares/validate.middleware");
const customerAuth_middleware_1 = require("../middlewares/customerAuth.middleware");
const customerAuth_validation_1 = require("../validations/customerAuth.validation");
const router = (0, express_1.Router)();
/**
 * Customer Authentication Routes
 * Base: /api/v1/customer
 */
// ── Public routes ────────────────────────────────────────────────────────────
/**
 * @swagger
 * tags:
 *   name: Customer Auth
 *   description: Customer registration and authentication via OTP.
 */
/**
 * @swagger
 * components:
 *   schemas:
 *     SendOtpPayload:
 *       type: object
 *       required:
 *         - name
 *         - email
 *       properties:
 *         name:
 *           type: string
 *           example: "John Doe"
 *         email:
 *           type: string
 *           example: "john@example.com"
 *     VerifyOtpPayload:
 *       type: object
 *       required:
 *         - email
 *         - otp
 *       properties:
 *         email:
 *           type: string
 *           example: "john@example.com"
 *         otp:
 *           type: string
 *           example: "123456"
 *     CustomerResponse:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         name:
 *           type: string
 *         email:
 *           type: string
 *         is_verified:
 *           type: boolean
 */
// ── Public routes ────────────────────────────────────────────────────────────
/**
 * @swagger
 * /api/v1/customer/send-otp:
 *   post:
 *     summary: Send OTP to customer email
 *     tags: [Customer Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SendOtpPayload'
 *     responses:
 *       200:
 *         description: OTP sent successfully
 *       429:
 *         description: Too many attempts
 */
router.post("/send-otp", (0, validate_middleware_1.validate)(customerAuth_validation_1.sendOtpValidation), CustomerAuthController.sendOtp);
/**
 * @swagger
 * /api/v1/customer/verify-otp:
 *   post:
 *     summary: Verify OTP and login/register
 *     tags: [Customer Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/VerifyOtpPayload'
 *     responses:
 *       200:
 *         description: OTP verified and token returned
 */
router.post("/verify-otp", (0, validate_middleware_1.validate)(customerAuth_validation_1.verifyOtpValidation), CustomerAuthController.verifyOtp);
/**
 * @swagger
 * /api/v1/customer/resend-otp:
 *   post:
 *     summary: Resend OTP
 *     tags: [Customer Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: OTP resent successfully
 */
router.post("/resend-otp", (0, validate_middleware_1.validate)(customerAuth_validation_1.resendOtpValidation), CustomerAuthController.resendOtp);
/**
 * @swagger
 * /api/v1/customer/logout:
 *   post:
 *     summary: Logout customer
 *     tags: [Customer Auth]
 *     responses:
 *       200:
 *         description: Logout successful
 */
router.post("/logout", CustomerAuthController.logout);
// ── Protected routes ─────────────────────────────────────────────────────────
/**
 * @swagger
 * /api/v1/customer/customer-info:
 *   get:
 *     summary: Get current customer info
 *     tags: [Customer Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Customer profile retrieved successfully
 */
router.get("/customer-info", customerAuth_middleware_1.verifyCustomerJWT, CustomerAuthController.me);
exports.default = router;
