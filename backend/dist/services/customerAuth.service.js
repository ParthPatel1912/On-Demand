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
exports.getCustomerById = exports.logout = exports.resendOtp = exports.verifyOtp = exports.sendOtp = void 0;
const sequelize_1 = require("sequelize");
const user_model_1 = __importDefault(require("../models/user.model"));
const customerOtp_model_1 = __importDefault(require("../models/customerOtp.model"));
const otp_util_1 = require("../utils/otp.util");
const email_service_1 = require("./email.service");
const token_service_1 = require("./token.service");
const apiError_util_1 = require("../utils/apiError.util");
const logger_1 = __importDefault(require("../utils/logger"));
const messages_1 = require("../constants/messages");
const enums_1 = require("../enums");
const AuthRepository = __importStar(require("../repositories/auth.repository"));
// ─────────────────────────────────────────────
// 0) Rate Limit Helper
// ─────────────────────────────────────────────
/**
 * Checks if the number of OTP requests for an email exceeds the limit (max 2 in 2 mins).
 */
const checkOtpRateLimit = (email) => __awaiter(void 0, void 0, void 0, function* () {
    const twoMinutesAgo = new Date(Date.now() - 120000); // 120,000 ms = 2 minutes
    const count = yield customerOtp_model_1.default.count({
        where: {
            email,
            createdAt: { [sequelize_1.Op.gte]: twoMinutesAgo },
        },
    });
    if (count >= 2) {
        logger_1.default.warn(`CustomerAuthService: Rate limit exceeded for ${email}`);
        throw new apiError_util_1.ApiError(enums_1.STATUS_CODE.TOO_MANY_REQUESTS, messages_1.MESSAGES.CUSTOMER.OTP_RATE_LIMIT);
    }
});
// ─────────────────────────────────────────────
// 1) Send OTP
// ─────────────────────────────────────────────
const sendOtp = (input) => __awaiter(void 0, void 0, void 0, function* () {
    const email = input.email.toLowerCase().trim();
    const name = input.name.trim();
    // Check rate limit (max 2 per 2 mins)
    yield checkOtpRateLimit(email);
    const otp = (0, otp_util_1.generateOtp)();
    const expires_at = (0, otp_util_1.getOtpExpiry)(10);
    // Partial cleanup: delete only records older than 10 minutes to keep history for rate limit
    const tenMinutesAgo = new Date(Date.now() - 600000);
    yield customerOtp_model_1.default.destroy({
        where: {
            email,
            createdAt: { [sequelize_1.Op.lt]: tenMinutesAgo },
        },
    });
    yield customerOtp_model_1.default.create({
        email,
        otp,
        expires_at,
        name,
    });
    // Send OTP email (throws if email fails — caught by controller)
    yield (0, email_service_1.sendOtpEmail)(email, name, otp);
    return { name, email };
});
exports.sendOtp = sendOtp;
// ─────────────────────────────────────────────
// 2) Verify OTP
// ─────────────────────────────────────────────
const verifyOtp = (input) => __awaiter(void 0, void 0, void 0, function* () {
    const email = input.email.toLowerCase().trim();
    const otp = input.otp.trim();
    const otpRecord = yield customerOtp_model_1.default.findOne({
        where: { email },
        order: [["createdAt", "DESC"]],
    });
    if (!otpRecord) {
        throw new apiError_util_1.ApiError(enums_1.STATUS_CODE.BAD_REQUEST, messages_1.MESSAGES.CUSTOMER.OTP_NOT_FOUND);
    }
    // IMPORTANT: Parse DB timestamp as UTC-naive
    const expiresAt = (0, otp_util_1.parseDbTimestampAsUTC)(otpRecord.expires_at);
    const now = Date.now();
    // 1) Expiry check first
    if (!otpRecord.expires_at || Number.isNaN(expiresAt) || now > expiresAt) {
        yield customerOtp_model_1.default.destroy({ where: { email } });
        throw new apiError_util_1.ApiError(enums_1.STATUS_CODE.BAD_REQUEST, messages_1.MESSAGES.CUSTOMER.OTP_EXPIRED);
    }
    // 2) OTP match check
    if (otpRecord.otp !== otp) {
        throw new apiError_util_1.ApiError(enums_1.STATUS_CODE.BAD_REQUEST, messages_1.MESSAGES.CUSTOMER.OTP_INCORRECT);
    }
    let user = yield AuthRepository.findUserByEmail(email);
    if (user) {
        if (user.name !== otpRecord.name) {
            yield user.update({
                name: otpRecord.name,
                emailVerifiedAt: new Date(),
            });
        }
        else if (!user.emailVerifiedAt) {
            yield user.update({ emailVerifiedAt: new Date() });
        }
        logger_1.default.info(`CustomerAuthService: Existing user logged in — ${email}`);
    }
    else {
        user = yield user_model_1.default.create({
            name: otpRecord.name,
            email,
            role: "customer",
            isActive: true,
            emailVerifiedAt: new Date(),
            password: "",
            mobileNumber: "",
        });
        logger_1.default.info(`CustomerAuthService: New customer registered — ${email}`);
    }
    // 3) Full cleanup — delete all OTP entries for this email on successful verification
    yield customerOtp_model_1.default.destroy({ where: { email } });
    const token = (0, token_service_1.generateToken)({ sub: user.id, email: user.email });
    return {
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            is_verified: !!user.emailVerifiedAt,
        },
        token,
        token_type: "Bearer",
        expires_in: (0, token_service_1.getExpiresIn)(),
    };
});
exports.verifyOtp = verifyOtp;
// ─────────────────────────────────────────────
// 3) Resend OTP
// ─────────────────────────────────────────────
const resendOtp = (input) => __awaiter(void 0, void 0, void 0, function* () {
    const email = input.email.toLowerCase().trim();
    // Check rate limit (max 2 per 2 mins)
    yield checkOtpRateLimit(email);
    const existingOtp = yield customerOtp_model_1.default.findOne({
        where: { email },
        order: [["createdAt", "DESC"]],
    });
    if (!existingOtp) {
        throw new apiError_util_1.ApiError(enums_1.STATUS_CODE.BAD_REQUEST, messages_1.MESSAGES.CUSTOMER.OTP_SESSION_NOT_FOUND);
    }
    const name = existingOtp.name;
    const otp = (0, otp_util_1.generateOtp)();
    const expires_at = (0, otp_util_1.getOtpExpiry)(10);
    // Partial cleanup: delete only records older than 10 minutes
    const tenMinutesAgo = new Date(Date.now() - 600000);
    yield customerOtp_model_1.default.destroy({
        where: {
            email,
            createdAt: { [sequelize_1.Op.lt]: tenMinutesAgo },
        },
    });
    yield customerOtp_model_1.default.create({
        email,
        otp,
        expires_at,
        name,
    });
    yield (0, email_service_1.sendOtpEmail)(email, name, otp);
    return { name, email };
});
exports.resendOtp = resendOtp;
const logout = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    logger_1.default.info(`CustomerAuthService: Logout requested for userId=${userId !== null && userId !== void 0 ? userId : "unknown"}`);
});
exports.logout = logout;
// ─────────────────────────────────────────────
// 4) Get current customer by ID (for /me route)
// ─────────────────────────────────────────────
const getCustomerById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield AuthRepository.findCustomerById(id);
    if (!user) {
        throw new apiError_util_1.ApiError(enums_1.STATUS_CODE.NOT_FOUND, messages_1.MESSAGES.CUSTOMER.NOT_FOUND);
    }
    return {
        id: user.id,
        name: user.name,
        email: user.email,
        is_verified: !!user.emailVerifiedAt,
    };
});
exports.getCustomerById = getCustomerById;
