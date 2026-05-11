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
exports.me = exports.logout = exports.resendOtp = exports.verifyOtp = exports.sendOtp = void 0;
const CustomerAuthService = __importStar(require("../services/customerAuth.service"));
const asyncHandler_util_1 = require("../utils/asyncHandler.util");
const logger_1 = __importDefault(require("../utils/logger"));
const response_util_1 = require("../utils/response.util");
const messages_1 = require("../constants/messages");
const enums_1 = require("../enums");
// ─────────────────────────────────────────────
// POST /api/v1/customer/send-otp
// ─────────────────────────────────────────────
exports.sendOtp = (0, asyncHandler_util_1.asyncHandler)((req, res, _next) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, email } = req.body;
    logger_1.default.info(`CustomerAuthController: send-otp requested for ${email}`);
    const data = yield CustomerAuthService.sendOtp({ name, email });
    (0, response_util_1.sendResponse)(res, messages_1.MESSAGES.AUTH.OTP_SENT, data);
}));
// ─────────────────────────────────────────────
// POST /api/v1/customer/verify-otp
// ─────────────────────────────────────────────
exports.verifyOtp = (0, asyncHandler_util_1.asyncHandler)((req, res, _next) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, otp } = req.body;
    logger_1.default.info(`CustomerAuthController: verify-otp requested for ${email}`);
    const data = yield CustomerAuthService.verifyOtp({ email, otp });
    (0, response_util_1.sendResponse)(res, messages_1.MESSAGES.AUTH.OTP_VERIFIED, data);
}));
// ─────────────────────────────────────────────
// POST /api/v1/customer/resend-otp
// ─────────────────────────────────────────────
exports.resendOtp = (0, asyncHandler_util_1.asyncHandler)((req, res, _next) => __awaiter(void 0, void 0, void 0, function* () {
    const { email } = req.body;
    logger_1.default.info(`CustomerAuthController: resend-otp requested for ${email}`);
    const data = yield CustomerAuthService.resendOtp({ email });
    (0, response_util_1.sendResponse)(res, messages_1.MESSAGES.AUTH.OTP_RESENT, data);
}));
// ─────────────────────────────────────────────
// POST /api/v1/customer/logout
// ─────────────────────────────────────────────
exports.logout = (0, asyncHandler_util_1.asyncHandler)((req, res, _next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const customerId = (_a = req.customer) === null || _a === void 0 ? void 0 : _a.sub;
    yield CustomerAuthService.logout(customerId);
    (0, response_util_1.sendResponse)(res, messages_1.MESSAGES.AUTH.LOGOUT_SUCCESS_ALT, []);
}));
// ─────────────────────────────────────────────
// GET /api/v1/customer/customer-info  (protected)
// ─────────────────────────────────────────────
exports.me = (0, asyncHandler_util_1.asyncHandler)((req, res, _next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const customerId = (_a = req.customer) === null || _a === void 0 ? void 0 : _a.sub;
    if (!customerId) {
        (0, response_util_1.sendError)(res, messages_1.MESSAGES.COMMON.UNAUTHORIZED, enums_1.STATUS_CODE.UNAUTHORIZED);
        return;
    }
    logger_1.default.info(`CustomerAuthController: /me requested for customer ${customerId}`);
    const user = yield CustomerAuthService.getCustomerById(customerId);
    (0, response_util_1.sendResponse)(res, messages_1.MESSAGES.CUSTOMER.PROFILE_FETCHED, { user });
}));
