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
exports.bulkUpsertCategories = exports.deleteCategory = exports.createCategory = exports.getCategoriesByMultipleServiceTypes = exports.getCategoriesByServiceType = void 0;
const sequelize_1 = require("sequelize");
const models_1 = require("../models");
const db_1 = __importDefault(require("../configs/db"));
const apiError_util_1 = require("../utils/apiError.util");
const logger_1 = __importDefault(require("../utils/logger"));
const cloudinary_util_1 = require("../utils/cloudinary.util");
const messages_1 = require("../constants/messages");
const enums_1 = require("../enums");
/**
 * Get all Categories for a Service Type
 * @param serviceTypeId ID of the service type
 */
const getCategoriesByServiceType = (serviceTypeId_1, ...args_1) => __awaiter(void 0, [serviceTypeId_1, ...args_1], void 0, function* (serviceTypeId, excludeEmpty = false) {
    logger_1.default.info(`CategoryService: Fetching categories for serviceTypeId: ${serviceTypeId}`);
    const categories = yield models_1.Category.findAll({
        where: { serviceTypeId: parseInt(serviceTypeId, 10) },
        include: [
            {
                model: models_1.SubCategory,
                as: 'subcategories',
                include: [
                    {
                        model: models_1.Service,
                        as: 'services',
                        required: false
                    }
                ]
            }
        ]
    });
    // Convert to JSON, add service count, and remove services from response
    let categoriesData = categories.map(category => category.toJSON());
    for (const category of categoriesData) {
        const subcategories = category.subcategories;
        if (Array.isArray(subcategories)) {
            for (const subcategory of subcategories) {
                const services = subcategory.services;
                subcategory.serviceCount = Array.isArray(services) ? services.filter((service) => service.availability === true).length : 0;
                delete subcategory.services;
            }
        }
    }
    if (excludeEmpty) {
        categoriesData = categoriesData.filter(category => {
            return Array.isArray(category.subcategories) && category.subcategories.length > 0;
        });
    }
    return categoriesData;
});
exports.getCategoriesByServiceType = getCategoriesByServiceType;
/**
 * Get all Categories for multiple Service Types in a single query
 * @param serviceTypeIds Array of service type ID strings
 * @param excludeEmpty Whether to exclude categories with no subcategories
 */
const getCategoriesByMultipleServiceTypes = (serviceTypeIds_1, ...args_1) => __awaiter(void 0, [serviceTypeIds_1, ...args_1], void 0, function* (serviceTypeIds, excludeEmpty = false) {
    const parsedIds = serviceTypeIds.map((id) => parseInt(id, 10)).filter((n) => !isNaN(n));
    logger_1.default.info(`CategoryService: Fetching categories for serviceTypeIds: [${parsedIds.join(', ')}]`);
    const categories = yield models_1.Category.findAll({
        where: { serviceTypeId: { [sequelize_1.Op.in]: parsedIds } },
        include: [
            {
                model: models_1.SubCategory,
                as: 'subcategories',
                include: [
                    {
                        model: models_1.Service,
                        as: 'services',
                        required: false,
                    },
                ],
            },
        ],
        order: [['serviceTypeId', 'ASC'], ['name', 'ASC']],
    });
    // Convert to JSON and compute serviceCount per subcategory
    let categoriesData = categories.map((category) => category.toJSON());
    for (const category of categoriesData) {
        const subcategories = category.subcategories;
        if (Array.isArray(subcategories)) {
            for (const subcategory of subcategories) {
                const services = subcategory.services;
                subcategory.serviceCount = Array.isArray(services)
                    ? services.filter((s) => s.availability === true).length
                    : 0;
                delete subcategory.services;
            }
        }
    }
    if (excludeEmpty) {
        categoriesData = categoriesData.filter((category) => Array.isArray(category.subcategories) && category.subcategories.length > 0);
    }
    return categoriesData;
});
exports.getCategoriesByMultipleServiceTypes = getCategoriesByMultipleServiceTypes;
/**
 * Create a new Category
 * @param serviceTypeId ID of the service type
 * @param name Category name
 * @param imageUrl Category image URL
 * @param cloudinaryId Category image Cloudinary ID
 */
const createCategory = (serviceTypeId, name, imageUrl, cloudinaryId) => __awaiter(void 0, void 0, void 0, function* () {
    logger_1.default.info(`CategoryService: Creating category '${name}' for serviceTypeId: ${serviceTypeId}`);
    const parsedServiceTypeId = parseInt(serviceTypeId, 10);
    const exists = yield models_1.Category.findOne({ where: { name, serviceTypeId: parsedServiceTypeId } });
    if (exists) {
        logger_1.default.warn(`Duplicate category name attempted: ${name} for serviceTypeId: ${serviceTypeId}`);
        throw new apiError_util_1.ApiError(enums_1.STATUS_CODE.BAD_REQUEST, messages_1.MESSAGES.CATEGORY.NAME_EXISTS);
    }
    return models_1.Category.create({ name, serviceTypeId: parsedServiceTypeId, imageUrl, cloudinaryId });
});
exports.createCategory = createCategory;
/**
 * Delete a Category
 * @param id Category ID
 */
const deleteCategory = (id) => __awaiter(void 0, void 0, void 0, function* () {
    logger_1.default.info(`CategoryService: Deleting category ID: ${id}`);
    const item = yield models_1.Category.findByPk(id);
    if (!item) {
        logger_1.default.warn(`Category not found ID: ${id}`);
        throw new apiError_util_1.ApiError(enums_1.STATUS_CODE.NOT_FOUND, messages_1.MESSAGES.CATEGORY.NOT_FOUND);
    }
    // Check if any Categories depend on this ServiceType
    const subCategoryCount = yield models_1.SubCategory.count({ where: { categoryId: item.id } });
    if (subCategoryCount > 0) {
        logger_1.default.warn(`Cannot delete Categories ID: ${id} because it has ${subCategoryCount} sub-categories attached.`);
        throw new apiError_util_1.ApiError(enums_1.STATUS_CODE.BAD_REQUEST, messages_1.MESSAGES.CATEGORY.CANNOT_DELETE_HAS_SUBCATEGORIES);
    }
    const serviceCount = yield models_1.Service.count({ where: { categoryId: item.id } });
    if (serviceCount > 0) {
        logger_1.default.warn(`Cannot delete Category ID: ${id} because it has ${serviceCount} services attached.`);
        throw new apiError_util_1.ApiError(enums_1.STATUS_CODE.BAD_REQUEST, messages_1.MESSAGES.CATEGORY.CANNOT_DELETE_HAS_SERVICES);
    }
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
    logger_1.default.info(`Deleted Category ID: ${id}`);
});
exports.deleteCategory = deleteCategory;
/**
 * Bulk Upsert Categories and Subcategories
 */
const bulkUpsertCategories = (serviceTypeId, categoriesData) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d;
    const t = yield db_1.default.transaction();
    try {
        // 1. Fetch current state
        const existingCategories = yield models_1.Category.findAll({
            where: { serviceTypeId },
            include: [{ model: models_1.SubCategory, as: "subcategories" }],
            transaction: t,
        });
        const stats = {
            createdCategories: 0,
            updatedCategories: 0,
            createdSubCategories: 0,
            updatedSubCategories: 0,
        };
        // 2. Process Input
        for (const cat of categoriesData) {
            let category = null;
            // Match by ID or Name
            if (cat.id) {
                category = (_a = existingCategories.find((c) => c.id === cat.id)) !== null && _a !== void 0 ? _a : null;
            }
            else {
                category = (_b = existingCategories.find((c) => c.name.toLowerCase() === cat.name.trim().toLowerCase())) !== null && _b !== void 0 ? _b : null;
            }
            if (category) {
                // Update existing category
                yield category.update({
                    name: cat.name.trim(),
                    imageUrl: cat.imageUrl !== undefined ? cat.imageUrl : category.imageUrl,
                    cloudinaryId: cat.cloudinaryId !== undefined ? cat.cloudinaryId : category.cloudinaryId,
                }, { transaction: t });
                stats.updatedCategories++;
            }
            else {
                // Create new category
                category = yield models_1.Category.create({
                    name: cat.name.trim(),
                    serviceTypeId,
                    imageUrl: cat.imageUrl,
                    cloudinaryId: cat.cloudinaryId,
                }, { transaction: t });
                stats.createdCategories++;
            }
            // Process Subcategories for this category
            const existingSubs = category.subcategories || [];
            if (cat.subCategories) {
                for (const sub of cat.subCategories) {
                    let subCategory = null;
                    if (sub.id) {
                        subCategory = (_c = existingSubs.find((s) => s.id === sub.id)) !== null && _c !== void 0 ? _c : null;
                    }
                    else {
                        subCategory = (_d = existingSubs.find((s) => s.name.toLowerCase() === sub.name.trim().toLowerCase())) !== null && _d !== void 0 ? _d : null;
                    }
                    if (subCategory) {
                        // Update existing subcategory
                        yield subCategory.update({
                            name: sub.name.trim(),
                            imageUrl: sub.imageUrl !== undefined ? sub.imageUrl : subCategory.imageUrl,
                            cloudinaryId: sub.cloudinaryId !== undefined ? sub.cloudinaryId : subCategory.cloudinaryId,
                        }, { transaction: t });
                        stats.updatedSubCategories++;
                    }
                    else {
                        // Create new subcategory
                        const newSub = yield models_1.SubCategory.create({
                            name: sub.name.trim(),
                            categoryId: category.id,
                            imageUrl: sub.imageUrl,
                            cloudinaryId: sub.cloudinaryId,
                        }, { transaction: t });
                        stats.createdSubCategories++;
                    }
                }
            }
        }
        yield t.commit();
        return { stats };
    }
    catch (err) {
        yield t.rollback();
        logger_1.default.error(`bulkUpsertCategories failed: ${err instanceof Error ? err.message : String(err)}`);
        throw err;
    }
});
exports.bulkUpsertCategories = bulkUpsertCategories;
