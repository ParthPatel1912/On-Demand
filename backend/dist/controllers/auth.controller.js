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
exports.logoutPartner = exports.resetPasswordPartner = exports.forgotPasswordPartner = exports.loginPartner = void 0;
const authService = __importStar(require("../services/auth.service"));
const logger_1 = __importDefault(require("../utils/logger"));
const response_util_1 = require("../utils/response.util");
const messages_1 = require("../constants/messages");
const common_utils_1 = require("../utils/common.utils");
/**
 * @name loginPartner
 * @description
 * Authenticate service partner users and return a JWT token.
 * Only active service partners can log in through this route.
 * @access Private
 */
const loginPartner = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield authService.loginPartner(req.body);
        return (0, response_util_1.sendResponse)(res, messages_1.MESSAGES.AUTH.LOGIN_SUCCESS, result);
    }
    catch (error) {
        logger_1.default.error(`Login error: ${(0, common_utils_1.getErrorMessage)(error)}`);
        next(error);
    }
});
exports.loginPartner = loginPartner;
/**
 * @name forgotPasswordPartner
 * @description
 * Initiate the password reset process for service partner users.
 * Generates a password reset token and sends it to the user's email.
 * Only active service partners can request a password reset through this route.
 * @access Private
 */
const forgotPasswordPartner = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email } = req.body;
        const data = yield authService.requestPasswordReset(email);
        return (0, response_util_1.sendResponse)(res, messages_1.MESSAGES.AUTH.PASSWORD_RESET_TOKEN_SENT, data);
    }
    catch (error) {
        logger_1.default.error(`Forgot password error: ${(0, common_utils_1.getErrorMessage)(error)}`);
        next(error);
    }
});
exports.forgotPasswordPartner = forgotPasswordPartner;
/**
 * @name resetPasswordPartner
 * @description
 * Reset the password for a service partner user using the provided reset token and new password.
 * Validates the reset token and updates the user's password if valid.
 * Only active service partners can reset their password through this route.
 * @access Private
 */
const resetPasswordPartner = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield authService.resetPasswordPartner(req.body);
        return (0, response_util_1.sendResponse)(res, messages_1.MESSAGES.AUTH.PASSWORD_RESET_SUCCESS, result);
    }
    catch (error) {
        logger_1.default.error(`Reset password error: ${(0, common_utils_1.getErrorMessage)(error)}`);
        next(error);
    }
});
exports.resetPasswordPartner = resetPasswordPartner;
/**
 * @name logoutPartner
 * @description
 * Logout a service partner user by invalidating their JWT token.
 * Removes the token from the user's record to prevent further use.
 * Only active service partners can log out through this route.
 * @access Private
 */
const logoutPartner = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.id;
        yield authService.logout(userId);
        return (0, response_util_1.sendResponse)(res, messages_1.MESSAGES.AUTH.LOGOUT_SUCCESS);
    }
    catch (error) {
        logger_1.default.error(`Logout error: ${(0, common_utils_1.getErrorMessage)(error)}`);
        next(error);
    }
});
exports.logoutPartner = logoutPartner;
