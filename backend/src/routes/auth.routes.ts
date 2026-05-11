import { Router } from "express";
import * as authController from "../controllers/auth.controller";
import { validate } from "@/middlewares/validate.middleware";
import {
  loginValidation,
  forgotPasswordValidation,
  resetPasswordValidation,
} from "@/validations/auth.validation";
import { verifyJWT } from "@/middlewares/auth.middleware";
import {
  createUserOrIpRateLimiter,
  numberFromEnv,
} from "@/middlewares/rateLimit.middleware";

const router = Router();

/**
 * Auth Routes
 * Base path: /api/auth
 */

// Auth rate limits (mostly unauthenticated; keys fall back to normalized IP).
// You can tune these with env vars:
const partnerRateLimiter = createUserOrIpRateLimiter("service:partner", {
  windowMs: 60000,
  limit: numberFromEnv("RATE_LIMIT_AUTH_PARTNER_MAX", 10),
});

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication management
 */

/**
 * @swagger
 * /api/auth/partner/login:
 *   post:
 *     summary: Login as a partner
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Success
 */
router.post(
  "/partner/login",
  partnerRateLimiter,
  validate(loginValidation),
  authController.loginPartner,
);

/**
 * @swagger
 * /api/auth/partner/forgot-password:
 *   post:
 *     summary: Request password reset link for partner
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Success
 */
router.post(
  "/partner/forgot-password",
  partnerRateLimiter,
  validate(forgotPasswordValidation),
  authController.forgotPasswordPartner,
);

/**
 * @swagger
 * /api/auth/partner/reset-password:
 *   post:
 *     summary: Reset partner password
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [token, newPassword]
 *             properties:
 *               token:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Success
 */
router.post(
  "/partner/reset-password",
  partnerRateLimiter,
  validate(resetPasswordValidation),
  authController.resetPasswordPartner,
);

/**
 * @swagger
 * /api/auth/partner/logout:
 *   post:
 *     summary: Logout partner
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 */
router.post(
  "/partner/logout",
  verifyJWT,
  partnerRateLimiter,
  authController.logoutPartner,
);

export default router;
