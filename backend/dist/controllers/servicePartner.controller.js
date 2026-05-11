"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAssignedServices = exports.approveRejectPartner = exports.getPartnerById = exports.deletePartner = exports.updatePartnerStatus = exports.getAllPartners = exports.register = void 0;
const servicePartnerService = __importStar(require("../services/servicePartner.service"));
const cloudinary_util_1 = require("../utils/cloudinary.util");
const cloudnary_1 = require("../configs/cloudnary");
const logger_1 = __importDefault(require("../utils/logger"));
const servicePartner_enum_1 = require("../enums/servicePartner.enum");
const response_util_1 = require("../utils/response.util");
const messages_1 = require("../constants/messages");
const enums_1 = require("../enums");
const common_utils_1 = require("../utils/common.utils");
/**
 * @name register
 * @description
 * Register a new service partner and upload their profile image and documents.
 * @access Public
 */
const register = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = req.body;
        const files = req.files;
        // 1. Handle File Uploads to Cloudinary
        const uploadedFiles = {
            profileImage: [],
            attachments: [],
        };
        if (files && files.profileImage) {
            const result = yield (0, cloudinary_util_1.uploadImage)(files.profileImage[0], `${cloudnary_1.CLOUDINARY_FOLDERS.SERVICE_PARTNER}/profile_images`);
            uploadedFiles.profileImage.push({
                path: result.url,
                cloudinaryId: result.publicId,
            });
        }
        if (files && files.attachments) {
            for (const doc of files.attachments) {
                const result = yield (0, cloudinary_util_1.uploadImage)(doc, `${cloudnary_1.CLOUDINARY_FOLDERS.SERVICE_PARTNER}/documents`);
                uploadedFiles.attachments.push({
                    path: result.url,
                    originalname: doc.originalname,
                    size: doc.size.toString(),
                    cloudinaryId: result.publicId,
                });
            }
        }
        // 3. Call Service
        const result = yield servicePartnerService.registerPartner(data, uploadedFiles);
        return (0, response_util_1.sendResponse)(res, messages_1.MESSAGES.AUTH.REGISTER_SUCCESS, result, enums_1.STATUS_CODE.CREATED);
    }
    catch (error) {
        logger_1.default.error((0, common_utils_1.getErrorMessage)(error));
        next(error);
    }
});
exports.register = register;
/**
 * @name getAllPartners
 * @description
 * Fetch all service partners with pagination and filtering.
 * @access Private | Admin
 */
const getAllPartners = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield servicePartnerService.getServicePartners(req.query);
        return (0, response_util_1.sendResponse)(res, {
            message: messages_1.MESSAGES.EXPERT.FETCHED,
            data: result.data,
            pagination: result.pagination,
        });
    }
    catch (error) {
        logger_1.default.error((0, common_utils_1.getErrorMessage)(error));
        next(error);
    }
});
exports.getAllPartners = getAllPartners;
/**
 * @name updatePartnerStatus
 * @description
 * Update the active status of a service partner.
 * @access Private | Admin
 */
const updatePartnerStatus = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const result = yield servicePartnerService.updateStatus(Number(id));
        return (0, response_util_1.sendResponse)(res, messages_1.MESSAGES.EXPERT.STATUS_UPDATED, result);
    }
    catch (error) {
        logger_1.default.error((0, common_utils_1.getErrorMessage)(error));
        next(error);
    }
});
exports.updatePartnerStatus = updatePartnerStatus;
/**
 * @name deletePartner
 * @description
 * Delete a service partner and their associated data.
 * @access Private | Admin
 */
const deletePartner = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const result = yield servicePartnerService.deleteServicePartner(Number(id));
        return (0, response_util_1.sendResponse)(res, messages_1.MESSAGES.EXPERT.DELETED, result);
    }
    catch (error) {
        logger_1.default.error((0, common_utils_1.getErrorMessage)(error));
        next(error);
    }
});
exports.deletePartner = deletePartner;
/**
 * @name getPartnerById
 * @description
 * Fetch detailed information of a service partner by their ID.
 * @access Private | Admin
 */
const getPartnerById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const result = yield servicePartnerService.getServicePartnerById(Number(id));
        return (0, response_util_1.sendResponse)(res, messages_1.MESSAGES.EXPERT.EXPERT_FETCHED, result);
    }
    catch (error) {
        logger_1.default.error((0, common_utils_1.getErrorMessage)(error));
        next(error);
    }
});
exports.getPartnerById = getPartnerById;
/**
 * @name approveRejectPartner
 * @description
 * Approve or reject a service partner registration request.
 * @access Private | Admin
 */
const approveRejectPartner = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { action } = req.body;
        if (!Object.values(servicePartner_enum_1.ApprovalAction).includes(action)) {
            return (0, response_util_1.sendError)(res, `Invalid action. Must be one of: ${Object.values(servicePartner_enum_1.ApprovalAction).join(", ")}`, enums_1.STATUS_CODE.BAD_REQUEST);
        }
        const result = yield servicePartnerService.approveRejectPartner(Number(id), action);
        return (0, response_util_1.sendResponse)(res, messages_1.MESSAGES.EXPERT.APPROVAL_UPDATED, result);
    }
    catch (error) {
        logger_1.default.error((0, common_utils_1.getErrorMessage)(error));
        next(error);
    }
});
exports.approveRejectPartner = approveRejectPartner;
/**
 * @name getAssignedServices
 * @description
 * Fetch services assigned to a specific service partner.
 * @access Private | Service Partner
 */
const getAssignedServices = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const result = yield servicePartnerService.getAssignedBookings(Number(id), req.query);
        return (0, response_util_1.sendResponse)(res, messages_1.MESSAGES.BOOKING.FETCHED, result);
    }
    catch (error) {
        logger_1.default.error((0, common_utils_1.getErrorMessage)(error));
        next(error);
    }
});
exports.getAssignedServices = getAssignedServices;
