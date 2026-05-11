"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateValidation = exports.createValidation = void 0;
const joi_1 = __importDefault(require("joi"));
exports.createValidation = joi_1.default.object({
    name: joi_1.default.string().max(100).required().messages({
        "any.required": "Name is required",
        "string.empty": "Name cannot be empty",
        "string.max": "Maximum 100 characters allowed",
    }),
    email: joi_1.default.string().email().max(150).required().messages({
        "any.required": "Email is required",
        "string.empty": "Email cannot be empty",
        "string.email": "Please enter a valid email address",
    }),
    mobile: joi_1.default.string().min(10).max(10).required().messages({
        "any.required": "Mobile number is required",
        "string.empty": "Mobile number cannot be empty",
        "string.min": "Mobile number must be exactly 10 digits",
        "string.max": "Mobile number must be exactly 10 digits",
    }),
    password: joi_1.default.string().min(8).required().messages({
        "any.required": "Password is required",
        "string.empty": "Password cannot be empty",
        "string.min": "Password must be at least 8 characters",
    }),
    confirmPassword: joi_1.default.any()
        .equal(joi_1.default.ref("password"))
        .required()
        .messages({
        "any.required": "Confirm password is required",
        "any.only": "Passwords do not match",
    }),
    isActive: joi_1.default.boolean().default(true),
});
exports.updateValidation = joi_1.default.object({
    name: joi_1.default.string().max(100).messages({
        "string.empty": "Name cannot be empty",
        "string.max": "Maximum 100 characters allowed",
    }),
    email: joi_1.default.string().email().max(150).messages({
        "string.empty": "Email cannot be empty",
        "string.email": "Please enter a valid email address",
    }),
    mobile: joi_1.default.string().min(10).max(10).messages({
        "string.empty": "Mobile number cannot be empty",
        "string.min": "Mobile number must be exactly 10 digits",
        "string.max": "Mobile number must be exactly 10 digits",
    }),
    isActive: joi_1.default.boolean(),
    password: joi_1.default.any().forbidden().messages({
        "any.unknown": "Password is not allowed",
    }),
    confirmPassword: joi_1.default.any().forbidden().messages({
        "any.unknown": "Confirm password is not allowed",
    }),
});
