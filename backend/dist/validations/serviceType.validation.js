"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateValidation = exports.createValidation = void 0;
const joi_1 = __importDefault(require("joi"));
exports.createValidation = joi_1.default.object({
    name: joi_1.default.string().max(100).required().messages({
        "any.required": "Service type is required",
        "string.empty": "Service type cannot be empty",
        "string.max": "Maximum 100 characters allowed",
    }),
    image: joi_1.default.any().optional(),
    bannerImage: joi_1.default.any().required().messages({
        "any.required": "Banner image is required",
    }),
});
exports.updateValidation = joi_1.default.object({
    name: joi_1.default.string().max(100).optional().messages({
        "string.empty": "Service type cannot be empty",
        "string.max": "Maximum 100 characters allowed",
    }),
    image: joi_1.default.any().optional(),
    bannerImage: joi_1.default.any().optional(),
});
