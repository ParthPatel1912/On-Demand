"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateValidation = exports.createValidation = void 0;
const joi_1 = __importDefault(require("joi"));
exports.createValidation = joi_1.default.object({
    name: joi_1.default.string().max(100).required(),
    image: joi_1.default.string().optional().messages({
        "any.required": "image is required",
        "string.base": "image is required",
        "string.empty": "image is required",
    }),
    imageUrl: joi_1.default.string().uri().optional().messages({
        "string.uri": "image must be a valid URL",
    }),
}).or("image", "imageUrl").messages({
    "object.missing": "image is required",
});
exports.updateValidation = joi_1.default.object({
    name: joi_1.default.string().max(100).optional(),
    image: joi_1.default.string().optional().messages({
        "string.base": "image is required",
        "string.empty": "image is required",
    }),
    imageUrl: joi_1.default.string().uri().optional(),
});
