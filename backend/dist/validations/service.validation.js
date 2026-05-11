"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.availabilityValidation = exports.updateValidation = exports.createValidation = void 0;
const joi_1 = __importDefault(require("joi"));
const stringArrayOrJson = joi_1.default.alternatives().try(joi_1.default.array().items(joi_1.default.string()).required(), joi_1.default.string().required());
exports.createValidation = joi_1.default.object({
    name: joi_1.default.string().max(100).required().messages({
        "any.required": "Name is required",
        "string.empty": "Name cannot be empty",
        "string.max": "Maximum 100 characters allowed",
    }),
    price: joi_1.default.number().precision(2).required().messages({
        "any.required": "Price is required",
        "number.base": "Price must be a number",
    }),
    duration: joi_1.default.number().integer().min(1).required().messages({
        "any.required": "Duration is required",
        "number.base": "Duration must be a number",
        "number.min": "Duration must be at least 1 minute",
    }),
    commission: joi_1.default.number().precision(2).required().messages({
        "any.required": "Commission is required",
        "number.base": "Commission must be a number",
    }),
    availability: joi_1.default.boolean().optional(),
    categoryId: joi_1.default.number().integer().optional(),
    includeServices: stringArrayOrJson.optional(),
    excludeServices: stringArrayOrJson.optional(),
    images: joi_1.default.array().max(10).optional(),
});
exports.updateValidation = joi_1.default.object({
    name: joi_1.default.string().max(100).optional().messages({
        "string.empty": "Name cannot be empty",
        "string.max": "Maximum 100 characters allowed",
    }),
    price: joi_1.default.number().precision(2).optional().messages({
        "number.base": "Price must be a number",
    }),
    duration: joi_1.default.number().integer().min(1).optional().messages({
        "number.base": "Duration must be a number",
        "number.min": "Duration must be at least 1 minute",
    }),
    commission: joi_1.default.number().precision(2).optional().messages({
        "number.base": "Commission must be a number",
    }),
    availability: joi_1.default.boolean().optional(),
    subCategoryId: joi_1.default.number().integer().optional(),
    includeServices: stringArrayOrJson.optional(),
    excludeServices: stringArrayOrJson.optional(),
    deletedImages: stringArrayOrJson.optional(),
    images: joi_1.default.array().max(10).optional(),
});
exports.availabilityValidation = joi_1.default.object({
    availability: joi_1.default.boolean().required(),
});
