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
const authController = __importStar(require("../controllers/auth.controller"));
const validate_middleware_1 = require("../middlewares/validate.middleware");
const auth_validation_1 = require("../validations/auth.validation");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const rateLimit_middleware_1 = require("../middlewares/rateLimit.middleware");
const router = (0, express_1.Router)();
/**
 * Auth Routes
 * Base path: /api/auth
 */
// Auth rate limits (mostly unauthenticated; keys fall back to normalized IP).
// You can tune these with env vars:
const partnerRateLimiter = (0, rateLimit_middleware_1.createUserOrIpRateLimiter)("service:partner", {
    windowMs: 60000,
    limit: (0, rateLimit_middleware_1.numberFromEnv)("RATE_LIMIT_AUTH_PARTNER_MAX", 10),
});
router.post("/partner/login", partnerRateLimiter, (0, validate_middleware_1.validate)(auth_validation_1.loginValidation), authController.loginPartner);
router.post("/partner/forgot-password", partnerRateLimiter, (0, validate_middleware_1.validate)(auth_validation_1.forgotPasswordValidation), authController.forgotPasswordPartner);
router.post("/partner/reset-password", partnerRateLimiter, (0, validate_middleware_1.validate)(auth_validation_1.resetPasswordValidation), authController.resetPasswordPartner);
router.post("/partner/logout", auth_middleware_1.verifyJWT, partnerRateLimiter, authController.logoutPartner);
exports.default = router;
