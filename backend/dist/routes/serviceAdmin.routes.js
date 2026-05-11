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
const serviceController = __importStar(require("../controllers/serviceAdmin.controller"));
const validate_middleware_1 = require("../middlewares/validate.middleware");
const service_validation_1 = require("../validations/service.validation");
const upload_middleware_1 = require("../middlewares/upload.middleware");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const rateLimit_middleware_1 = require("../middlewares/rateLimit.middleware");
const serviceAdminCache_util_1 = require("../utils/caching-utils/serviceAdminCache.util");
const router = (0, express_1.Router)();
// Rate limits:
// - Use `verifyJWT` + per-user keying when available (falls back to normalized IP).
// - Defaults can be overridden via env by constructing limiters with different values.
const serviceAdminPostRateLimiter = (0, rateLimit_middleware_1.createUserOrIpRateLimiter)("service:post", {
    windowMs: (0, rateLimit_middleware_1.numberFromEnv)("RATE_LIMIT_SERVICE_POST_WINDOW_MS", 60 * 1000),
    limit: (0, rateLimit_middleware_1.numberFromEnv)("RATE_LIMIT_SERVICE_POST_MAX", 20),
});
const serviceAdminPutRateLimiter = (0, rateLimit_middleware_1.createUserOrIpRateLimiter)("service:put", {
    windowMs: (0, rateLimit_middleware_1.numberFromEnv)("RATE_LIMIT_SERVICE_PUT_WINDOW_MS", 60 * 1000),
    limit: (0, rateLimit_middleware_1.numberFromEnv)("RATE_LIMIT_SERVICE_PUT_MAX", 30),
});
const serviceAdminPatchRateLimiter = (0, rateLimit_middleware_1.createUserOrIpRateLimiter)("service:patch", {
    windowMs: (0, rateLimit_middleware_1.numberFromEnv)("RATE_LIMIT_SERVICE_PATCH_WINDOW_MS", 60 * 1000),
    limit: (0, rateLimit_middleware_1.numberFromEnv)("RATE_LIMIT_SERVICE_PATCH_MAX", 60),
});
const serviceAdminDeleteRateLimiter = (0, rateLimit_middleware_1.createUserOrIpRateLimiter)("service:delete", {
    windowMs: (0, rateLimit_middleware_1.numberFromEnv)("RATE_LIMIT_SERVICE_DELETE_WINDOW_MS", 60 * 1000),
    limit: (0, rateLimit_middleware_1.numberFromEnv)("RATE_LIMIT_SERVICE_DELETE_MAX", 60),
});
/**
 * @name listByCategory
 * @description Lists services under a category with filtering/search and pagination (cached).
 * @access Role-based
 */
router.get("/categories/:categoryId/services", 
// Cache this read-heavy list endpoint (query params are part of the cache key).
(0, serviceAdminCache_util_1.serviceAdminCache)(120), serviceController.listByCategory);
/**
 * @name getServiceById
 * @description Returns a single service by id.
 * @access Public
 */
router.get("/services/:id", serviceController.getServiceById);
/**
 * @name getServiceByIdForAdmin
 * @description Returns a single service by id for admin users.
 * @access Role-based
 */
router.get("/services/admin/:id", auth_middleware_1.verifyJWT, auth_middleware_1.checkActiveUser, serviceController.getServiceByIdForAdmin);
/**
 * @name create
 * @description Creates a service under a category and sub-category (supports multiple images; rate-limited).
 * @access Role-based
 */
router.post("/categories/:categoryId/subcategories/:subCategoryId/services", auth_middleware_1.verifyJWT, auth_middleware_1.checkActiveUser, serviceAdminPostRateLimiter, upload_middleware_1.upload.array("images", 10), (0, validate_middleware_1.validate)(service_validation_1.createValidation), serviceController.create);
/**
 * @name update
 * @description Updates a service (supports image updates and deletes; rate-limited).
 * @access Role-based
 */
router.put("/services/:id", auth_middleware_1.verifyJWT, auth_middleware_1.checkActiveUser, serviceAdminPutRateLimiter, upload_middleware_1.upload.array("images", 10), (0, validate_middleware_1.validate)(service_validation_1.updateValidation), serviceController.update);
/**
 * @name updateAvailability
 * @description Toggles service availability (rate-limited).
 * @access Role-based
 */
router.patch("/services/:id/availability", auth_middleware_1.verifyJWT, auth_middleware_1.checkActiveUser, serviceAdminPatchRateLimiter, (0, validate_middleware_1.validate)(service_validation_1.availabilityValidation), serviceController.updateAvailability);
/**
 * @name remove
 * @description Deletes a service (rate-limited).
 * @access Role-based
 */
router.delete("/services/:id", auth_middleware_1.verifyJWT, auth_middleware_1.checkActiveUser, auth_middleware_1.verifyJWT, serviceAdminDeleteRateLimiter, serviceController.remove);
exports.default = router;
