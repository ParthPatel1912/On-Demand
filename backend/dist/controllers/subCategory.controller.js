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
exports.deleteSubCategory = exports.createSubCategory = exports.getSubCategories = void 0;
const SubCategoryService = __importStar(require("../services/subCategory.service"));
const logger_1 = __importDefault(require("../utils/logger"));
const response_util_1 = require("../utils/response.util");
const cloudinary_util_1 = require("../utils/cloudinary.util");
const apiError_util_1 = require("../utils/apiError.util");
const messages_1 = require("../constants/messages");
const enums_1 = require("../enums");
/**
 * Get SubCategories by Category ID
 */
const getSubCategories = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { categoryId } = req.params;
        const data = yield SubCategoryService.getSubCategoriesByCategory(categoryId);
        return (0, response_util_1.sendResponse)(res, undefined, data);
    }
    catch (error) {
        logger_1.default.error(error.message);
        next(error);
    }
});
exports.getSubCategories = getSubCategories;
/**
 * Add a new SubCategory
 */
const createSubCategory = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        logger_1.default.info("Create SubCategory request");
        const { categoryId } = req.params;
        const { name } = req.body;
        if (!req.file) {
            throw new apiError_util_1.ApiError(400, "Image is mandatory");
        }
        const uploadResult = yield (0, cloudinary_util_1.uploadImage)(req.file, `${cloudinary_util_1.CLOUDINARY_FOLDERS.SERVICE_TYPE}/sub_categories`);
        const data = yield SubCategoryService.createSubCategory(categoryId, name.trim(), uploadResult.url, uploadResult.publicId);
        return (0, response_util_1.sendResponse)(res, messages_1.MESSAGES.SUBCATEGORY.CREATED, data, enums_1.STATUS_CODE.CREATED);
    }
    catch (error) {
        logger_1.default.error(error.message);
        next(error);
    }
});
exports.createSubCategory = createSubCategory;
/**
 * Delete a SubCategory
 */
const deleteSubCategory = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        yield SubCategoryService.deleteSubCategory(id);
        return (0, response_util_1.sendResponse)(res, messages_1.MESSAGES.SUBCATEGORY.DELETED);
    }
    catch (error) {
        logger_1.default.error(error.message);
        next(error);
    }
});
exports.deleteSubCategory = deleteSubCategory;
