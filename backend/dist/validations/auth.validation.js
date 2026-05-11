"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPasswordValidation = exports.forgotPasswordValidation = exports.loginValidation = void 0;
const joi_1 = __importDefault(require("joi"));
exports.loginValidation = joi_1.default.object({
    email: joi_1.default.string().email().required().messages({
        "string.email": "Invalid email format",
        "any.required": "Email is required",
    }),
    password: joi_1.default.string().required().messages({
        "any.required": "Password is required",
    }),
});
exports.forgotPasswordValidation = joi_1.default.object({
    email: joi_1.default.string().email().required().messages({
        "string.email": "Invalid email format",
        "any.required": "Email is required",
    }),
});
exports.resetPasswordValidation = joi_1.default.object({
    token: joi_1.default.string().required().messages({
        "any.required": "Reset token is required",
    }),
    newPassword: joi_1.default.string().min(6).required().messages({
        "string.min": "Password must be at least 6 characters long",
        "any.required": "New password is required",
    }),
});
