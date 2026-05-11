"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.approveRejectPartnerValidation = exports.registerPartnerValidation = void 0;
const joi_1 = __importDefault(require("joi"));
const servicePartner_enum_1 = require("../enums/servicePartner.enum");
exports.registerPartnerValidation = joi_1.default.object({
    profileImage: joi_1.default.any().optional(),
    fullName: joi_1.default.string().min(2).required().messages({
        "any.required": "Full Name is required",
        "string.empty": "Full Name cannot be empty",
        "string.min": "Full Name must be at least 2 characters",
    }),
    email: joi_1.default.string().email().required().messages({
        "any.required": "Email is required",
        "string.empty": "Email cannot be empty",
        "string.email": "Please enter a valid email address",
    }),
    dob: joi_1.default.string()
        .pattern(/^\d{2}\/\d{2}\/\d{4}$/)
        .required()
        .messages({
        "any.required": "Date of birth is required",
        "string.empty": "Date of birth cannot be empty",
        "string.pattern.base": "Date of birth must be in DD/MM/YYYY format",
    }),
    gender: joi_1.default.string()
        .valid(...Object.values(servicePartner_enum_1.Gender))
        .required()
        .messages({
        "any.required": "Please select gender",
        "any.only": `Gender must be one of: ${Object.values(servicePartner_enum_1.Gender).join(", ")}`,
    }),
    mobile: joi_1.default.string().min(10).max(10).required().messages({
        "any.required": "Mobile number is required",
        "string.empty": "Mobile number cannot be empty",
        "string.min": "Mobile number must be of 10 digits",
        "string.max": "Mobile number must be of 10 digits",
    }),
    applyingFor: joi_1.default.array()
        .items(joi_1.default.number().integer())
        .min(1)
        .required()
        .messages({
        "any.required": "Please select at least one service type",
        "array.base": "Please select at least one service type",
        "array.min": "Please select at least one service type",
    }),
    permanentAddress: joi_1.default.string().allow("", null),
    residentialAddress: joi_1.default.string().allow("", null),
    // Arrays
    education: joi_1.default.array()
        .items(joi_1.default.object({
        school: joi_1.default.string().required().messages({
            "any.required": "School/College name is required",
            "string.empty": "School/College name is required",
        }),
        year: joi_1.default.number()
            .integer()
            .min(1900)
            .max(new Date().getFullYear())
            .required()
            .messages({
            "any.required": "Passing year is required",
        }),
        marks: joi_1.default.number().min(0).max(100).required().messages({
            "any.required": "Marks are required",
            "number.base": "Marks must be a number",
            "number.min": "Marks cannot be less than 0",
            "number.max": "Marks cannot exceed 100",
        }),
    }))
        .min(1)
        .required()
        .messages({
        "any.required": "At least one educational info is required",
        "array.min": "At least one educational info is required",
    }),
    professional: joi_1.default.array()
        .items(joi_1.default.object({
        company: joi_1.default.string().allow("", null),
        role: joi_1.default.string().allow("", null),
        from: joi_1.default.string().allow("", null),
        to: joi_1.default.string().allow("", null),
    }))
        .optional(),
    skills: joi_1.default.array().items(joi_1.default.number().integer()).min(1).required().messages({
        "any.required": "At least one skill is required",
    }),
    servicesOffered: joi_1.default.array()
        .items(joi_1.default.number().integer())
        .min(1)
        .required()
        .messages({
        "any.required": "Please select at least one service",
    }),
    languages: joi_1.default.array()
        .items(joi_1.default.object({
        language: joi_1.default.string().required().messages({
            "any.required": "Language is required",
            "string.empty": "Language is required",
        }),
        proficiency: joi_1.default.string()
            .valid("beginner", "intermediate", "expert", "Beginner", "Intermediate", "Expert")
            .required()
            .messages({
            "any.required": "Proficiency level is required",
            "string.empty": "Proficiency level is required",
        }),
    }))
        .min(1)
        .required()
        .messages({
        "any.required": "At least one language is required",
        "array.min": "At least one language is required",
    }),
    attachments: joi_1.default.array().min(1).required().messages({
        "any.required": "At least one document is required",
        "array.min": "At least one document is required",
    }),
});
exports.approveRejectPartnerValidation = joi_1.default.object({
    action: joi_1.default.string()
        .valid(...Object.values(servicePartner_enum_1.ApprovalAction))
        .required()
        .messages({
        "any.required": "Action is required",
        "any.only": `Invalid action. Must be one of: ${Object.values(servicePartner_enum_1.ApprovalAction).join(", ")}`,
    }),
});
