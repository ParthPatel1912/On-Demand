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
exports.logout = exports.resetPasswordPartner = exports.requestPasswordReset = exports.loginPartner = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const AuthRepository = __importStar(require("../repositories/auth.repository"));
const apiError_util_1 = require("../utils/apiError.util");
const userRole_enum_1 = require("../enums/userRole.enum");
const mail_util_1 = require("../utils/mail.util");
const messages_1 = require("../constants/messages");
const enums_1 = require("../enums");
const constants_1 = require("../constants");
const JWT_SECRET = process.env.JWT_SECRET || "default_secret";
const JWT_EXPIRY = process.env.JWT_EXPIRY || constants_1.DEFAULT_JWT_EXPIRY;
/**
 * @name loginPartner
 * @description
 * Authenticate service partner users and return a JWT token.
 * Only active service partners can log in through this route.
 * @access Private
 */
const loginPartner = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { email, password } = payload;
    // 1. Find User
    const user = yield AuthRepository.findUserByEmailWithRole(email);
    if (!user) {
        throw new apiError_util_1.ApiError(enums_1.STATUS_CODE.NOT_FOUND, messages_1.MESSAGES.AUTH.INVALID_CREDENTIALS);
    }
    const roleName = (_a = user.role) === null || _a === void 0 ? void 0 : _a.name;
    // 2. Check Role (Only Service Partners can login through this route)
    if (roleName !== userRole_enum_1.UserRole.SERVICE_PARTNER) {
        throw new apiError_util_1.ApiError(enums_1.STATUS_CODE.FORBIDDEN, messages_1.MESSAGES.AUTH.ACCESS_DENIED_NOT_PARTNER);
    }
    // 3. Check if Active
    if (!user.isActive) {
        throw new apiError_util_1.ApiError(enums_1.STATUS_CODE.FORBIDDEN, messages_1.MESSAGES.AUTH.ACCOUNT_NOT_ACTIVATED);
    }
    // 4. Check Password
    if (!user.password) {
        throw new apiError_util_1.ApiError(enums_1.STATUS_CODE.BAD_REQUEST, messages_1.MESSAGES.AUTH.PASSWORD_NOT_SET);
    }
    const isPasswordMatch = yield bcrypt_1.default.compare(password, user.password);
    if (!isPasswordMatch) {
        throw new apiError_util_1.ApiError(enums_1.STATUS_CODE.UNAUTHORIZED, messages_1.MESSAGES.AUTH.INVALID_CREDENTIALS);
    }
    // 5. Generate Token
    const token = jsonwebtoken_1.default.sign({
        sub: user.id,
        email: user.email,
        role: roleName,
    }, JWT_SECRET, { expiresIn: JWT_EXPIRY });
    return {
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: roleName,
            mobileNumber: user.mobileNumber,
        },
        token,
    };
});
exports.loginPartner = loginPartner;
/**
 * @name requestPasswordReset
 * @description
 * Initiate password reset process for service partners by generating a reset token and sending an email.
 * Only service partners can request password resets through this route.
 * @access Private
 */
const requestPasswordReset = (email) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const user = yield AuthRepository.findUserByEmailWithRole(email);
    if (!user) {
        throw new apiError_util_1.ApiError(enums_1.STATUS_CODE.NOT_FOUND, messages_1.MESSAGES.AUTH.INVALID_CREDENTIALS);
    }
    const roleName = (_a = user.role) === null || _a === void 0 ? void 0 : _a.name;
    if (roleName !== userRole_enum_1.UserRole.SERVICE_PARTNER) {
        throw new apiError_util_1.ApiError(enums_1.STATUS_CODE.FORBIDDEN, messages_1.MESSAGES.AUTH.PASSWORD_RESET_ONLY_FOR_PARTNERS);
    }
    // Check if account is active
    if (!user.isActive) {
        throw new apiError_util_1.ApiError(enums_1.STATUS_CODE.FORBIDDEN, messages_1.MESSAGES.AUTH.ACCOUNT_NOT_ACTIVATED);
    }
    // Generate a JWT for password reset that expires in 24 hours
    const resetToken = jsonwebtoken_1.default.sign({ sub: user.id, email: user.email, role: roleName, type: "password_reset" }, JWT_SECRET, { expiresIn: JWT_EXPIRY });
    user.rememberToken = resetToken;
    yield user.save();
    const resetLink = `${process.env.FRONTEND_URL}/partner/reset-password?token=${resetToken}`;
    yield (0, mail_util_1.sendForgotPasswordEmail)(user.email, user.name, resetLink);
    return { email };
});
exports.requestPasswordReset = requestPasswordReset;
/**
 * @name resetPasswordPartner
 * @description
 * Reset the password for a service partner using the provided reset token and new password.
 * The reset token is validated against the JWT secret and must match the token stored in the database for the user.
 * This ensures that the token is valid, has not expired, and has not been used before.
 * Only service partners can reset their passwords through this route.
 * @access Private
 */
const resetPasswordPartner = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const { token, newPassword } = payload;
    try {
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        if (decoded.type !== "password_reset") {
            throw new apiError_util_1.ApiError(enums_1.STATUS_CODE.BAD_REQUEST, messages_1.MESSAGES.AUTH.INVALID_RESET_TOKEN_TYPE);
        }
        const user = yield AuthRepository.findUserByResetToken(decoded.sub, token);
        if (!user) {
            throw new apiError_util_1.ApiError(enums_1.STATUS_CODE.BAD_REQUEST, messages_1.MESSAGES.AUTH.PASSWORD_RESET_LINK_EXPIRED);
        }
        user.password = yield bcrypt_1.default.hash(newPassword, constants_1.BCRYPT_SALT_ROUNDS);
        // Set to null to clear in DB
        user.set("rememberToken", null);
        yield user.save();
    }
    catch (error) {
        if (error instanceof Error && error.name === "TokenExpiredError") {
            throw new apiError_util_1.ApiError(enums_1.STATUS_CODE.BAD_REQUEST, messages_1.MESSAGES.AUTH.PASSWORD_RESET_EXPIRED);
        }
        if (error instanceof apiError_util_1.ApiError)
            throw error;
        throw new apiError_util_1.ApiError(enums_1.STATUS_CODE.BAD_REQUEST, messages_1.MESSAGES.AUTH.INVALID_RESET_TOKEN);
    }
    return true;
});
exports.resetPasswordPartner = resetPasswordPartner;
/**
 * @name logout
 * @description
 * Log out a user by clearing their remember token in the database.
 * This effectively invalidates any existing sessions or tokens associated with that user.
 * @access Private
 */
const logout = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield AuthRepository.findUserById(userId);
    if (user) {
        user.set("rememberToken", null);
        yield user.save();
    }
    return true;
});
exports.logout = logout;
