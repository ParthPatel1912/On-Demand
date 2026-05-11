"use strict";
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
exports.deleteSubCategory = exports.createSubCategory = exports.getSubCategoriesByCategory = void 0;
const cloudinary_util_1 = require("../utils/cloudinary.util");
const models_1 = require("../models");
const apiError_util_1 = require("../utils/apiError.util");
const logger_1 = __importDefault(require("../utils/logger"));
const messages_1 = require("../constants/messages");
const enums_1 = require("../enums");
/**
 * Get all SubCategories for a Category
 * @param categoryId ID of the category
 */
const getSubCategoriesByCategory = (categoryId) => __awaiter(void 0, void 0, void 0, function* () {
    logger_1.default.info(`SubCategoryService: Fetching subcategories for categoryId: ${categoryId}`);
    return models_1.SubCategory.findAll({ where: { categoryId: parseInt(categoryId, 10) } });
});
exports.getSubCategoriesByCategory = getSubCategoriesByCategory;
/**
 * Create a new SubCategory
 * @param categoryId ID of the category
 * @param name SubCategory name
 * @param imageUrl SubCategory image URL
 * @param cloudinaryId SubCategory image Cloudinary ID
 */
const createSubCategory = (categoryId, name, imageUrl, cloudinaryId) => __awaiter(void 0, void 0, void 0, function* () {
    logger_1.default.info(`SubCategoryService: Creating subcategory '${name}' for categoryId: ${categoryId}`);
    const parsedCategoryId = parseInt(categoryId, 10);
    const exists = yield models_1.SubCategory.findOne({ where: { name, categoryId: parsedCategoryId } });
    if (exists) {
        logger_1.default.warn(`Duplicate subcategory name attempted: ${name} for categoryId: ${categoryId}`);
        throw new apiError_util_1.ApiError(enums_1.STATUS_CODE.BAD_REQUEST, messages_1.MESSAGES.SUBCATEGORY.NAME_EXISTS);
    }
    return models_1.SubCategory.create({ name, categoryId: parsedCategoryId, imageUrl, cloudinaryId });
});
exports.createSubCategory = createSubCategory;
/**
 * Delete a SubCategory
 * @param id SubCategory ID
 */
const deleteSubCategory = (id) => __awaiter(void 0, void 0, void 0, function* () {
    logger_1.default.info(`SubCategoryService: Deleting subcategory ID: ${id}`);
    const item = yield models_1.SubCategory.findByPk(id);
    if (!item) {
        logger_1.default.warn(`SubCategory not found ID: ${id}`);
        throw new apiError_util_1.ApiError(enums_1.STATUS_CODE.NOT_FOUND, messages_1.MESSAGES.SUBCATEGORY.NOT_FOUND);
    }
    const serviceCount = yield models_1.Service.count({ where: { subCategoryId: item.id } });
    if (serviceCount > 0) {
        logger_1.default.warn(`Cannot delete SubCategory ID: ${id} because it has ${serviceCount} services attached.`);
        throw new apiError_util_1.ApiError(enums_1.STATUS_CODE.BAD_REQUEST, messages_1.MESSAGES.SUBCATEGORY.CANNOT_DELETE_HAS_SERVICES);
    }
    // // Check if any Categories depend on this ServiceType
    // const serviceManagementCount = await ServiceManagement.count({ where: { subCategoryId: item.id } });
    // if (serviceManagementCount > 0) {
    //   logger.warn(`Cannot delete SubCategories ID: ${id} because it has ${serviceManagementCount} subCategories attached.`);
    //   throw new ApiError(STATUS_CODE.BAD_REQUEST, MESSAGES.SUBCATEGORY.CANNOT_DELETE_HAS_SERVICE_MANAGEMENT);
    // }
    if (item.cloudinaryId) {
        try {
            yield (0, cloudinary_util_1.deleteImage)(item.cloudinaryId);
            logger_1.default.info(`Deleted Cloudinary image: ${item.cloudinaryId}`);
        }
        catch (err) {
            logger_1.default.error(`Failed to delete Cloudinary image: ${err.message}`);
        }
    }
    yield item.destroy();
    logger_1.default.info(`Deleted SubCategory ID: ${id}`);
});
exports.deleteSubCategory = deleteSubCategory;
