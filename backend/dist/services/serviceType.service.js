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
exports.getPartnerServiceTypesHierarchy = exports.getServiceTypesHierarchy = exports.deleteServiceType = exports.createServiceType = exports.getPublicServices = exports.getServiceTypeById = exports.getAllServiceTypes = exports.getServiceTypes = exports.updateServiceType = void 0;
const models_1 = require("../models");
const apiError_util_1 = require("../utils/apiError.util");
const cloudinary_util_1 = require("../utils/cloudinary.util");
const logger_1 = __importDefault(require("../utils/logger"));
const sequelize_1 = require("sequelize");
const booking_model_1 = __importDefault(require("../models/booking.model"));
const transaction_enum_1 = require("../enums/transaction.enum");
const landingCache_util_1 = require("../utils/caching-utils/landingCache.util");
const enums_1 = require("../enums");
const messages_1 = require("../constants/messages");
/**
 * Create a new Service Type
 * @param name Service Type name
 * @param file Optional new main image
 * @param bannerFile Optional new banner image
 */
const updateServiceType = (id, name, file, bannerFile) => __awaiter(void 0, void 0, void 0, function* () {
    logger_1.default.info(`ServiceTypeService: Updating service type ID: ${id}`);
    const item = yield models_1.ServiceType.findByPk(id);
    if (!item) {
        logger_1.default.warn(`Service type not found ID: ${id}`);
        throw new apiError_util_1.ApiError(enums_1.STATUS_CODE.NOT_FOUND, messages_1.MESSAGES.COMMON.NOT_FOUND);
    }
    if (name) {
        const dup = yield models_1.ServiceType.findOne({ where: { name } });
        if (dup && dup.id !== +id) {
            logger_1.default.warn(`Duplicate name attempted on update: ${name}`);
            throw new apiError_util_1.ApiError(enums_1.STATUS_CODE.BAD_REQUEST, messages_1.MESSAGES.COMMON.NAME_DUPLICATE);
        }
        item.name = name;
    }
    // Update Main Image
    if (file) {
        // Delete old image if exists
        if (item.cloudinaryId) {
            yield (0, cloudinary_util_1.deleteImage)(item.cloudinaryId).catch(err => logger_1.default.error(`Failed to delete old image: ${err.message}`));
        }
        const result = yield (0, cloudinary_util_1.uploadImage)(file, `${cloudinary_util_1.CLOUDINARY_FOLDERS.SERVICE_TYPE}/icon`);
        item.image = result.url;
        item.cloudinaryId = result.publicId;
    }
    // Update Banner Image
    if (bannerFile) {
        // Delete old banner if exists
        if (item.bannerCloudinaryId) {
            yield (0, cloudinary_util_1.deleteImage)(item.bannerCloudinaryId).catch(err => logger_1.default.error(`Failed to delete old banner: ${err.message}`));
        }
        const result = yield (0, cloudinary_util_1.uploadImage)(bannerFile, `${cloudinary_util_1.CLOUDINARY_FOLDERS.SERVICE_TYPE}/banner_image`);
        item.bannerImage = result.url;
        item.bannerCloudinaryId = result.publicId;
    }
    (0, landingCache_util_1.clearLandingHomeCache)();
    yield item.save();
    logger_1.default.info(`ServiceType updated ID: ${item.id}`);
    return item;
});
exports.updateServiceType = updateServiceType;
/**
 * @name getServiceTypes
 * @description Returns all service types with pagination.
 * @access Private
 */
const getServiceTypes = (query) => __awaiter(void 0, void 0, void 0, function* () {
    const page = Math.max(1, Number(query.page || 1));
    const limit = Math.max(1, Number(query.limit || 10));
    const offset = (page - 1) * limit;
    logger_1.default.info(`ServiceTypeService: Fetching service types with page: ${page}, limit: ${limit}`);
    const { rows, count } = yield models_1.ServiceType.findAndCountAll({
        limit,
        offset,
        order: [["createdAt", "DESC"]],
    });
    return {
        data: rows,
        pagination: {
            totalItems: count,
            currentPage: page,
            totalPages: Math.ceil(count / limit),
            limit,
        },
    };
});
exports.getServiceTypes = getServiceTypes;
/**
 * @name getAllServiceTypes
 * @description Returns service types with a computed total completed bookings count across nested categories/subcategories/services.
 * @access Private
 */
const getAllServiceTypes = () => __awaiter(void 0, void 0, void 0, function* () {
    const serviceTypes = yield models_1.ServiceType.findAll({
        attributes: [
            "id",
            "name",
            "image",
            "bannerImage",
            "createdAt",
            "updatedAt",
        ],
        include: [
            {
                model: models_1.Category,
                as: "categories",
                required: false,
                attributes: ["id"],
                include: [
                    {
                        model: models_1.SubCategory,
                        as: "subcategories",
                        required: false,
                        attributes: ["id"],
                        include: [
                            {
                                model: models_1.Service,
                                as: "services",
                                required: false,
                                attributes: ["id"],
                                include: [
                                    {
                                        model: booking_model_1.default,
                                        as: "bookings",
                                        required: false,
                                        attributes: ["id", "status"],
                                    },
                                ],
                            },
                        ],
                    },
                ],
            },
        ],
    });
    return serviceTypes.map((serviceType) => {
        var _a;
        let totalBookings = 0;
        for (const category of serviceType.categories || []) {
            for (const sub of category.subcategories || []) {
                for (const service of sub.services || []) {
                    const completedBookings = ((_a = service.bookings) === null || _a === void 0 ? void 0 : _a.filter((b) => String(b.status) === transaction_enum_1.BookingStatus.COMPLETED)) ||
                        [];
                    totalBookings += completedBookings.length;
                }
            }
        }
        return {
            id: serviceType.id,
            name: serviceType.name,
            image: serviceType.image,
            bannerImage: serviceType.bannerImage,
            bookings: totalBookings,
            createdAt: serviceType.createdAt,
            updatedAt: serviceType.updatedAt,
        };
    });
});
exports.getAllServiceTypes = getAllServiceTypes;
/**
 * Get Service Type by ID
 * @param id Service Type ID
 */
const getServiceTypeById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    logger_1.default.info(`ServiceTypeService: Fetching service type ID: ${id}`);
    const serviceType = yield models_1.ServiceType.findByPk(id, {
        include: [
            {
                model: models_1.Category,
                as: "categories",
                required: false,
                include: [
                    {
                        model: models_1.SubCategory,
                        as: "subcategories",
                        required: false,
                        include: [
                            {
                                model: models_1.Service,
                                as: "services",
                                required: false,
                            },
                        ],
                    },
                ],
            },
        ],
    });
    if (!serviceType) {
        logger_1.default.warn(`Service type not found ID: ${id}`);
        throw new apiError_util_1.ApiError(enums_1.STATUS_CODE.NOT_FOUND, messages_1.MESSAGES.SERVICE_TYPE.NOT_FOUND);
    }
    // Calculate total services count
    let totalServices = 0;
    const serviceTypeAny = serviceType;
    const categories = serviceTypeAny.categories;
    if (Array.isArray(categories)) {
        for (const category of categories) {
            const subcategories = category.subcategories;
            if (Array.isArray(subcategories)) {
                for (const subcategory of subcategories) {
                    const services = subcategory.services;
                    if (Array.isArray(services)) {
                        totalServices += services.filter((service) => service.availability === true).length;
                    }
                }
            }
        }
    }
    // Add totalServices count to the response
    const serviceTypeData = serviceType.toJSON();
    serviceTypeData.totalServices = totalServices;
    return serviceTypeData;
});
exports.getServiceTypeById = getServiceTypeById;
/**
 * @name getPublicServices
 * @description Lists available services for a service type with search/subcategory filtering and offset-based pagination ("load more").
 * @access Private
 */
const getPublicServices = (serviceTypeId, query) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    const limit = Math.min(50, Math.max(1, (_a = query.limit) !== null && _a !== void 0 ? _a : 12));
    const offset = Math.max(0, (_b = query.offset) !== null && _b !== void 0 ? _b : 0);
    const where = {
        availability: true // Only show available services
    };
    // Search by service name only
    if ((_c = query.q) === null || _c === void 0 ? void 0 : _c.trim()) {
        where.name = { [sequelize_1.Op.iLike]: `%${query.q.trim()}%` };
    }
    // Filter by subcategory ID
    if (typeof query.subCategoryId === "number" && !Number.isNaN(query.subCategoryId)) {
        where.subCategoryId = query.subCategoryId;
    }
    logger_1.default.info(`PublicService: Getting services for serviceTypeId=${serviceTypeId} - search=${query.q}, subCategoryId=${query.subCategoryId}, offset=${offset}, limit=${limit}`);
    const { rows, count } = yield models_1.Service.findAndCountAll({
        where,
        include: [
            {
                model: models_1.SubCategory,
                as: "subCategory",
                required: true,
                include: [
                    {
                        model: models_1.Category,
                        as: "category",
                        required: true,
                        where: {
                            serviceTypeId: parseInt(serviceTypeId, 10)
                        },
                        include: [
                            {
                                model: models_1.ServiceType,
                                as: "serviceType",
                                required: true
                            }
                        ]
                    }
                ]
            }
        ],
        order: [
            ["createdAt", "DESC"],
            ["id", "DESC"]
        ],
        limit,
        offset,
    });
    const hasMore = offset + rows.length < count;
    const nextOffset = hasMore ? offset + limit : undefined;
    return {
        data: rows.map(service => ({
            id: service.id,
            name: service.name,
            price: service.price,
            duration: service.duration,
            images: service.images,
            includeServices: service.includeServices,
            excludeServices: service.excludeServices,
        })),
        hasMore,
        nextOffset,
        pagination: {
            totalItems: count,
            currentPage: Math.floor(offset / limit) + 1,
            totalPages: Math.ceil(count / limit),
            limit,
        },
    };
});
exports.getPublicServices = getPublicServices;
/**
 * Update Service Type
 * @param id Service Type ID
 * @param name Optional new name
 * @param file Optional new image
 */
const createServiceType = (name, file, bannerFile) => __awaiter(void 0, void 0, void 0, function* () {
    logger_1.default.info(`ServiceTypeService: Creating service type with name: ${name}`);
    let imageUrl = "";
    let cloudinaryId = "";
    let bannerImageUrl = "";
    let bannerCloudinaryId = "";
    const exists = yield models_1.ServiceType.findOne({ where: { name } });
    if (exists) {
        logger_1.default.warn(`Duplicate service type name attempted: ${name}`);
        throw new apiError_util_1.ApiError(enums_1.STATUS_CODE.BAD_REQUEST, messages_1.MESSAGES.COMMON.NAME_DUPLICATE);
    }
    // Handle Main Image
    if (file) {
        const result = yield (0, cloudinary_util_1.uploadImage)(file, `${cloudinary_util_1.CLOUDINARY_FOLDERS.SERVICE_TYPE}/icon`);
        imageUrl = result.url;
        cloudinaryId = result.publicId;
    }
    // Handle Banner Image
    if (bannerFile) {
        const result = yield (0, cloudinary_util_1.uploadImage)(bannerFile, `${cloudinary_util_1.CLOUDINARY_FOLDERS.SERVICE_TYPE}/banner_image`);
        bannerImageUrl = result.url;
        bannerCloudinaryId = result.publicId;
    }
    (0, landingCache_util_1.clearLandingHomeCache)();
    return models_1.ServiceType.create({
        name,
        image: imageUrl,
        cloudinaryId,
        bannerImage: bannerImageUrl,
        bannerCloudinaryId
    });
});
exports.createServiceType = createServiceType;
/**
 * Delete Service Type
 * @param id Service Type ID
 */
const deleteServiceType = (id) => __awaiter(void 0, void 0, void 0, function* () {
    logger_1.default.info(`ServiceTypeService: Deleting service type ID: ${id}`);
    const item = yield models_1.ServiceType.findByPk(id);
    if (!item)
        throw new apiError_util_1.ApiError(enums_1.STATUS_CODE.NOT_FOUND, messages_1.MESSAGES.SERVICE_TYPE.NOT_FOUND);
    // Check if any Categories depend on this ServiceType
    const categoryCount = yield models_1.Category.count({ where: { serviceTypeId: parseInt(id, 10) } });
    if (categoryCount > 0) {
        logger_1.default.warn(`Cannot delete ServiceType ID: ${id} because it has ${categoryCount} categories attached.`);
        throw new apiError_util_1.ApiError(enums_1.STATUS_CODE.BAD_REQUEST, messages_1.MESSAGES.SERVICE_TYPE.CANNOT_DELETE);
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
    if (item.bannerCloudinaryId) {
        try {
            yield (0, cloudinary_util_1.deleteImage)(item.bannerCloudinaryId);
            logger_1.default.info(`Deleted Cloudinary image: ${item.bannerCloudinaryId}`);
        }
        catch (err) {
            logger_1.default.error(`Failed to delete Cloudinary image: ${err.message}`);
        }
    }
    (0, landingCache_util_1.clearLandingHomeCache)();
    yield item.destroy();
    logger_1.default.info(`Deleted ServiceType ID: ${id}`);
});
exports.deleteServiceType = deleteServiceType;
/**
 * @name getServiceTypesHierarchy
 * @description Returns service types with nested categories/sub-categories and attaches per-category servicesCount for hierarchy screens.
 * @access Private
 */
const getServiceTypesHierarchy = () => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    logger_1.default.info("ServiceTypeService: Fetching service types hierarchy");
    const serviceTypes = yield models_1.ServiceType.findAll({
        include: [
            {
                model: models_1.Category,
                as: "categories",
                required: false,
                include: [
                    {
                        model: models_1.SubCategory,
                        as: "subcategories",
                        required: false,
                    },
                ],
            },
        ],
        order: [["createdAt", "DESC"]],
    });
    const serviceCountsByCategory = yield models_1.Service.findAll({
        attributes: ["categoryId", [(0, sequelize_1.fn)("COUNT", (0, sequelize_1.col)("id")), "servicesCount"]],
        group: ["categoryId"],
        raw: true,
    });
    const countMap = new Map();
    for (const row of serviceCountsByCategory) {
        const categoryId = Number(row.categoryId);
        const servicesCount = Number(row.servicesCount);
        if (!Number.isNaN(categoryId)) {
            countMap.set(categoryId, Number.isFinite(servicesCount) ? servicesCount : 0);
        }
    }
    for (const serviceType of serviceTypes) {
        const categories = serviceType
            .categories;
        if (!Array.isArray(categories))
            continue;
        for (const category of categories) {
            const model = category;
            const categoryId = Number(model.id);
            (_a = model.setDataValue) === null || _a === void 0 ? void 0 : _a.call(model, "servicesCount", (_b = countMap.get(categoryId)) !== null && _b !== void 0 ? _b : 0);
        }
    }
    return serviceTypes;
});
exports.getServiceTypesHierarchy = getServiceTypesHierarchy;
/**
 * @name getPartnerServiceTypesHierarchy
 * @description Returns the hierarchy scoped to a service partner’s service type, and attaches per-category servicesCount.
 * @access Private
 */
const getPartnerServiceTypesHierarchy = (partnerId) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    logger_1.default.info(`PartnerServiceTypeService: Fetching partner service types hierarchy for partnerId=${partnerId}`);
    // 1. Get the service_type_id for the given partnerId
    const partner = yield models_1.ServicePartner.findOne({
        where: { userId: partnerId },
    });
    if (!partner) {
        throw new apiError_util_1.ApiError(enums_1.STATUS_CODE.NOT_FOUND, messages_1.MESSAGES.EXPERT.NOT_FOUND_PARTNER);
    }
    // 2. Fetch hierarchy only for the partner's service type
    const serviceTypes = yield models_1.ServiceType.findAll({
        where: {
            id: partner.serviceTypeIds,
        },
        include: [
            {
                model: models_1.Category,
                as: "categories",
                required: false,
                include: [
                    {
                        model: models_1.SubCategory,
                        as: "subcategories",
                        required: false,
                    },
                ],
            },
        ],
        order: [["createdAt", "DESC"]],
    });
    const serviceCountsByCategory = yield models_1.Service.findAll({
        attributes: ["categoryId", [(0, sequelize_1.fn)("COUNT", (0, sequelize_1.col)("id")), "servicesCount"]],
        group: ["categoryId"],
        raw: true,
    });
    const countMap = new Map();
    for (const row of serviceCountsByCategory) {
        const categoryId = Number(row.categoryId);
        const servicesCount = Number(row.servicesCount);
        if (!Number.isNaN(categoryId)) {
            countMap.set(categoryId, Number.isFinite(servicesCount) ? servicesCount : 0);
        }
    }
    for (const serviceType of serviceTypes) {
        const categories = serviceType
            .categories;
        if (!Array.isArray(categories))
            continue;
        for (const category of categories) {
            const model = category;
            const categoryId = Number(model.id);
            (_a = model.setDataValue) === null || _a === void 0 ? void 0 : _a.call(model, "servicesCount", (_b = countMap.get(categoryId)) !== null && _b !== void 0 ? _b : 0);
        }
    }
    return serviceTypes;
});
exports.getPartnerServiceTypesHierarchy = getPartnerServiceTypesHierarchy;
