"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.bulkCreateValidation = exports.updateValidation = exports.createValidation = void 0;
const joi_1 = __importDefault(require("joi"));
exports.createValidation = joi_1.default.object({
    name: joi_1.default.string().max(100).required(),
    image: joi_1.default.string().optional().messages({
        "string.base": "image is required",
    }), // image is the field name in multipart request
    imageUrl: joi_1.default.string().uri().optional(),
}).or("image", "imageUrl").messages({
    "object.missing": "image is required",
});
exports.updateValidation = joi_1.default.object({
    name: joi_1.default.string().max(100).optional(),
    image: joi_1.default.string().optional().messages({
        "string.base": "image is required",
    }),
    imageUrl: joi_1.default.string().uri().optional(),
});
exports.bulkCreateValidation = joi_1.default.object({
    categories: joi_1.default.array().items(joi_1.default.object({
        id: joi_1.default.number().integer().optional(),
        name: joi_1.default.string().max(100).required(),
        imageUrl: joi_1.default.string().uri().optional(),
        image: joi_1.default.string().optional().messages({
            "string.base": "image is required",
        }),
        subCategories: joi_1.default.array().items(joi_1.default.object({
            id: joi_1.default.number().integer().optional(),
            name: joi_1.default.string().max(100).required(),
            imageUrl: joi_1.default.string().uri().optional(),
            image: joi_1.default.string().optional().messages({
                "string.base": "image is required",
            }),
        }).or("imageUrl", "image").messages({
            "object.missing": "image is required",
        })).allow(null).optional()
    }).or("imageUrl", "image").messages({
        "object.missing": "image is required",
    })).min(1).required()
}).unknown(true);
