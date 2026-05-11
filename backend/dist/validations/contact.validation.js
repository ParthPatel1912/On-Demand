"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createValidation = void 0;
const joi_1 = __importDefault(require("joi"));
exports.createValidation = joi_1.default.object({
    firstName: joi_1.default.string().max(100).required().messages({
        "any.required": "First name is required",
        "string.empty": "First name cannot be empty",
        "string.max": "First name cannot exceed 100 characters",
    }),
    lastName: joi_1.default.string().max(100).required().messages({
        "any.required": "Last name is required",
        "string.empty": "Last name cannot be empty",
        "string.max": "Last name cannot exceed 100 characters",
    }),
    mobile: joi_1.default.string().min(10).max(10).required().messages({
        "any.required": "Mobile number is required",
        "string.empty": "Mobile number cannot be empty",
        "string.min": "Mobile number must be exactly 10 digits",
        "string.max": "Mobile number must be exactly 10 digits",
    }),
    email: joi_1.default.string().email().required().messages({
        "any.required": "Email is required",
        "string.empty": "Email cannot be empty",
        "string.email": "Please enter a valid email address",
    }),
    description: joi_1.default.string().min(10).max(500).required().messages({
        "any.required": "Please provide a description",
        "string.empty": "Description cannot be empty",
        "string.min": "Description must be longer than 10 characters",
        "string.max": "Description cannot exceed 500 characters",
    }),
});
