"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateRoleSchema = exports.createRoleSchema = void 0;
const joi_1 = __importDefault(require("joi"));
exports.createRoleSchema = joi_1.default.object({
    name: joi_1.default.string().max(50).required().messages({
        "any.required": "Role name is required",
        "string.empty": "Role name cannot be empty",
    }),
    description: joi_1.default.string().max(255).allow(null, ""),
});
exports.updateRoleSchema = joi_1.default.object({
    name: joi_1.default.string().max(50).messages({
        "string.empty": "Role name cannot be empty",
    }),
    description: joi_1.default.string().max(255).allow(null, ""),
});
