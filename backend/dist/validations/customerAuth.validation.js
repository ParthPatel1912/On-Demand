"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resendOtpValidation = exports.verifyOtpValidation = exports.sendOtpValidation = void 0;
const joi_1 = __importDefault(require("joi"));
exports.sendOtpValidation = joi_1.default.object({
    name: joi_1.default.string().min(2).max(150).required().messages({
        "any.required": "Name is required",
        "string.empty": "Name cannot be empty",
        "string.min": "Name must be at least 2 characters",
        "string.max": "Name cannot exceed 150 characters",
    }),
    email: joi_1.default.string().email().max(255).required().messages({
        "any.required": "Email is required",
        "string.empty": "Email cannot be empty",
        "string.email": "Please provide a valid email address",
        "string.max": "Email cannot exceed 255 characters",
    }),
});
exports.verifyOtpValidation = joi_1.default.object({
    email: joi_1.default.string().email().max(255).required().messages({
        "any.required": "Email is required",
        "string.empty": "Email cannot be empty",
        "string.email": "Please provide a valid email address",
    }),
    otp: joi_1.default.string()
        .pattern(/^\d{4}$/)
        .required()
        .messages({
        "any.required": "OTP is required",
        "string.empty": "OTP cannot be empty",
        "string.pattern.base": "OTP must be exactly 4 digits",
    }),
});
exports.resendOtpValidation = joi_1.default.object({
    email: joi_1.default.string().email().max(255).required().messages({
        "any.required": "Email is required",
        "string.empty": "Email cannot be empty",
        "string.email": "Please provide a valid email address",
    }),
});
