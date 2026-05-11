"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateValidation = exports.createValidation = void 0;
const joi_1 = __importDefault(require("joi"));
const messages_1 = require("../constants/messages");
exports.createValidation = joi_1.default.object({
    coupon_code: joi_1.default.string().trim().max(50).required().messages({
        "any.required": messages_1.MESSAGES.OFFER_VALIDATION.COUPON_CODE_REQUIRED,
        "string.empty": messages_1.MESSAGES.OFFER_VALIDATION.COUPON_CODE_EMPTY,
        "string.max": messages_1.MESSAGES.OFFER_VALIDATION.COUPON_CODE_MAX,
    }),
    coupon_description: joi_1.default.string().allow("", null).max(1000).messages({
        "string.max": messages_1.MESSAGES.OFFER_VALIDATION.COUPON_DESCRIPTION_MAX,
    }),
    discount_percentage: joi_1.default.number()
        .min(0)
        .max(90)
        .precision(2)
        .required()
        .messages({
        "any.required": messages_1.MESSAGES.OFFER_VALIDATION.DISCOUNT_PERCENTAGE_REQUIRED,
        "number.base": messages_1.MESSAGES.OFFER_VALIDATION.DISCOUNT_PERCENTAGE_NUMBER,
        "number.min": messages_1.MESSAGES.OFFER_VALIDATION.DISCOUNT_PERCENTAGE_MIN,
        "number.max": messages_1.MESSAGES.OFFER_VALIDATION.DISCOUNT_PERCENTAGE_MAX,
    }),
    max_usage: joi_1.default.number().integer().min(0).default(0).messages({
        "any.required": messages_1.MESSAGES.OFFER_VALIDATION.MAX_USAGE_REQUIRED,
        "number.base": messages_1.MESSAGES.OFFER_VALIDATION.MAX_USAGE_NUMBER,
        "number.integer": messages_1.MESSAGES.OFFER_VALIDATION.MAX_USAGE_INTEGER,
        "number.min": messages_1.MESSAGES.OFFER_VALIDATION.MAX_USAGE_MIN,
    }),
    used_count: joi_1.default.number().integer().min(0).default(0).messages({
        "number.base": messages_1.MESSAGES.OFFER_VALIDATION.USED_COUNT_NUMBER,
        "number.integer": messages_1.MESSAGES.OFFER_VALIDATION.USED_COUNT_INTEGER,
        "number.min": messages_1.MESSAGES.OFFER_VALIDATION.USED_COUNT_MIN,
    }),
    is_active: joi_1.default.boolean().default(true),
})
    .custom((value, helpers) => {
    if (value.max_usage > 0 && value.used_count > value.max_usage) {
        return helpers.error("any.invalid");
    }
    return value;
})
    .messages({
    "any.invalid": messages_1.MESSAGES.OFFER_VALIDATION.USED_COUNT_MAX,
});
exports.updateValidation = joi_1.default.object({
    coupon_code: joi_1.default.string().trim().max(50).messages({
        "string.empty": messages_1.MESSAGES.OFFER_VALIDATION.COUPON_CODE_EMPTY,
        "string.max": messages_1.MESSAGES.OFFER_VALIDATION.COUPON_CODE_MAX,
    }),
    coupon_description: joi_1.default.string().allow("", null).max(1000).messages({
        "string.max": messages_1.MESSAGES.OFFER_VALIDATION.COUPON_DESCRIPTION_MAX,
    }),
    discount_percentage: joi_1.default.number().min(0).max(90).precision(2).messages({
        "number.base": messages_1.MESSAGES.OFFER_VALIDATION.DISCOUNT_PERCENTAGE_NUMBER,
        "number.min": messages_1.MESSAGES.OFFER_VALIDATION.DISCOUNT_PERCENTAGE_MIN,
        "number.max": messages_1.MESSAGES.OFFER_VALIDATION.DISCOUNT_PERCENTAGE_MAX,
    }),
    max_usage: joi_1.default.number().integer().min(0).messages({
        "number.base": messages_1.MESSAGES.OFFER_VALIDATION.MAX_USAGE_NUMBER,
        "number.integer": messages_1.MESSAGES.OFFER_VALIDATION.MAX_USAGE_INTEGER,
        "number.min": messages_1.MESSAGES.OFFER_VALIDATION.MAX_USAGE_MIN,
    }),
    used_count: joi_1.default.number().integer().min(0).messages({
        "number.base": messages_1.MESSAGES.OFFER_VALIDATION.USED_COUNT_NUMBER,
        "number.integer": messages_1.MESSAGES.OFFER_VALIDATION.USED_COUNT_INTEGER,
        "number.min": messages_1.MESSAGES.OFFER_VALIDATION.USED_COUNT_MIN,
    }),
    is_active: joi_1.default.boolean(),
})
    .min(1)
    .custom((value, helpers) => {
    if (value.max_usage !== undefined &&
        value.used_count !== undefined &&
        value.max_usage > 0 &&
        value.used_count > value.max_usage) {
        return helpers.error("any.invalid");
    }
    return value;
})
    .messages({
    "object.min": "At least one field is required to update the offer",
    "any.invalid": messages_1.MESSAGES.OFFER_VALIDATION.USED_COUNT_MAX,
});
