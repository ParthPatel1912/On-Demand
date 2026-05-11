"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateCustomerStatusValidation = exports.createCustomerValidation = void 0;
const joi_1 = __importDefault(require("joi"));
exports.createCustomerValidation = joi_1.default.object({
    name: joi_1.default.string().max(150).required().messages({
        "any.required": "Name is required",
        "string.empty": "Name cannot be empty",
        "string.max": "Maximum 150 characters allowed",
    }),
    email: joi_1.default.string().email().max(150).required().messages({
        "any.required": "Email is required",
        "string.empty": "Email cannot be empty",
        "string.email": "Please enter a valid email address",
    }),
    mobileNumber: joi_1.default.string().min(10).max(10).required().messages({
        "any.required": "Mobile number is required",
        "string.empty": "Mobile number cannot be empty",
        "string.min": "Mobile number must be exactly 10 digits",
        "string.max": "Mobile number must be exactly 10 digits",
    }),
});
exports.updateCustomerStatusValidation = joi_1.default.object({
    isActive: joi_1.default.boolean().required().messages({
        "any.required": "isActive status is required",
        "boolean.base": "isActive must be a boolean",
    }),
});
