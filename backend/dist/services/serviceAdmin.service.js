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
exports.deleteService = exports.updateServiceAvailability = exports.updateService = exports.createService = exports.getService = exports.listServicesByCategory = void 0;
const sequelize_1 = require("sequelize");
const apiError_util_1 = require("../utils/apiError.util");
const cloudinary_util_1 = require("../utils/cloudinary.util");
const logger_1 = __importDefault(require("../utils/logger"));
const landingCache_util_1 = require("../utils/caching-utils/landingCache.util");
const serviceAdminCache_util_1 = require("../utils/caching-utils/serviceAdminCache.util");
const messages_1 = require("../constants/messages");
const enums_1 = require("../enums");
const serviceAdmin_repository_1 = require("../repositories/serviceAdmin.repository");
/**
 * @name listServicesByCategory
 * @description Lists services under a category with filters (query text, price range, availability, commission) and pagination.
 * @access Private
 */
const listServicesByCategory = (categoryId, query) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    const parsedCategoryId = parseInt(categoryId, 10);
    if (Number.isNaN(parsedCategoryId))
        throw new apiError_util_1.ApiError(enums_1.STATUS_CODE.BAD_REQUEST, messages_1.MESSAGES.CATEGORY.INVALID_ID);
    const page = Math.max(1, (_a = query.page) !== null && _a !== void 0 ? _a : 1);
    const limit = Math.min(100, Math.max(1, (_b = query.limit) !== null && _b !== void 0 ? _b : 10));
    const offset = (page - 1) * limit;
    const where = {};
    if ((_c = query.q) === null || _c === void 0 ? void 0 : _c.trim()) {
        where[sequelize_1.Op.or] = [{ name: { [sequelize_1.Op.iLike]: `%${query.q.trim()}%` } }];
    }
    if (typeof query.availability === "boolean") {
        where.availability = query.availability;
    }
    if (typeof query.commission === "number" && !Number.isNaN(query.commission)) {
        where.commission = query.commission;
    }
    if (typeof query.priceMin === "number" ||
        typeof query.priceMax === "number") {
        where.price = Object.assign(Object.assign({}, (typeof query.priceMin === "number"
            ? { [sequelize_1.Op.gte]: query.priceMin }
            : {})), (typeof query.priceMax === "number"
            ? { [sequelize_1.Op.lte]: query.priceMax }
            : {}));
    }
    logger_1.default.info(`ServiceAdminService: Listing services for categoryId=${categoryId}, page=${page}, limit=${limit}`);
    where.categoryId = parsedCategoryId;
    if (typeof query.subCategoryId === "number" &&
        !Number.isNaN(query.subCategoryId)) {
        where.subCategoryId = query.subCategoryId;
    }
    const { rows: data, count: totalItems } = yield serviceAdmin_repository_1.serviceAdminRepository.listServicesByCategory(where, limit, offset);
    return {
        data,
        pagination: {
            currentPage: page,
            limit,
            totalItems,
            totalPages: Math.ceil(totalItems / limit),
        },
    };
});
exports.listServicesByCategory = listServicesByCategory;
/**
 * @name getService
 * @description Returns a service by id with its service type attached; blocks inactive services.
 * @access Private
 */
const getService = (serviceId, opts) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    const parsedServiceId = parseInt(serviceId, 10);
    if (Number.isNaN(parsedServiceId))
        throw new apiError_util_1.ApiError(enums_1.STATUS_CODE.BAD_REQUEST, messages_1.MESSAGES.SERVICE.INVALID_SERVICE_ID);
    const service = yield serviceAdmin_repository_1.serviceAdminRepository.getServiceById(parsedServiceId);
    if (!service) {
        throw new apiError_util_1.ApiError(enums_1.STATUS_CODE.NOT_FOUND, messages_1.MESSAGES.SERVICE.NOT_FOUND);
    }
    if (service.availability !== true && (opts === null || opts === void 0 ? void 0 : opts.isAdmin) !== true) {
        throw new apiError_util_1.ApiError(enums_1.STATUS_CODE.SERVICE_NOT_ACTIVE, messages_1.MESSAGES.SERVICE.NOT_ACTIVE);
    }
    const sub = service.get("subCategory");
    const cat = (_a = sub === null || sub === void 0 ? void 0 : sub.get) === null || _a === void 0 ? void 0 : _a.call(sub, "category");
    const st = (_b = cat === null || cat === void 0 ? void 0 : cat.get) === null || _b === void 0 ? void 0 : _b.call(cat, "serviceType");
    const stId = st === null || st === void 0 ? void 0 : st.id;
    const stName = st === null || st === void 0 ? void 0 : st.name;
    if (typeof stId === "number" && typeof stName === "string") {
        service.setDataValue("serviceType", { id: stId, name: stName });
        (_c = cat === null || cat === void 0 ? void 0 : cat.setDataValue) === null || _c === void 0 ? void 0 : _c.call(cat, "serviceType", undefined);
    }
    return service;
});
exports.getService = getService;
/**
 * @name createService
 * @description Creates a service under a category/sub-category, uploads images, and clears related caches.
 * @access Private
 */
const createService = (categoryId, subCategoryId, payload, files) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e;
    const parsedCategoryId = parseInt(categoryId, 10);
    const parsedSubCategoryId = parseInt(subCategoryId, 10);
    if (Number.isNaN(parsedCategoryId))
        throw new apiError_util_1.ApiError(enums_1.STATUS_CODE.BAD_REQUEST, messages_1.MESSAGES.CATEGORY.INVALID_ID);
    if (Number.isNaN(parsedSubCategoryId))
        throw new apiError_util_1.ApiError(enums_1.STATUS_CODE.BAD_REQUEST, messages_1.MESSAGES.SUBCATEGORY.INVALID_ID);
    const [category, subCategory] = yield Promise.all([
        serviceAdmin_repository_1.serviceAdminRepository.getCategoryById(parsedCategoryId),
        serviceAdmin_repository_1.serviceAdminRepository.getSubCategoryById(parsedSubCategoryId),
    ]);
    if (!category)
        throw new apiError_util_1.ApiError(enums_1.STATUS_CODE.NOT_FOUND, messages_1.MESSAGES.CATEGORY.NOT_FOUND);
    if (!subCategory)
        throw new apiError_util_1.ApiError(enums_1.STATUS_CODE.NOT_FOUND, messages_1.MESSAGES.SUBCATEGORY.NOT_FOUND);
    if (subCategory.categoryId !== parsedCategoryId) {
        throw new apiError_util_1.ApiError(enums_1.STATUS_CODE.BAD_REQUEST, messages_1.MESSAGES.SUBCATEGORY.NOT_BELONG_TO_CATEGORY);
    }
    const trimmedName = (_a = payload.name) === null || _a === void 0 ? void 0 : _a.trim();
    if (!trimmedName)
        throw new apiError_util_1.ApiError(enums_1.STATUS_CODE.BAD_REQUEST, messages_1.MESSAGES.SERVICE.NAME_REQUIRED);
    const existing = yield serviceAdmin_repository_1.serviceAdminRepository.findDuplicateService(parsedCategoryId, parsedSubCategoryId, trimmedName);
    if (existing) {
        throw new apiError_util_1.ApiError(enums_1.STATUS_CODE.CONFLICT, messages_1.MESSAGES.SERVICE.NAME_DUPLICATE_UNDER_SUBCATEGORY);
    }
    const images = [];
    const cloudinaryIds = [];
    if (files.length) {
        for (const file of files) {
            const result = yield (0, cloudinary_util_1.uploadImage)(file, cloudinary_util_1.CLOUDINARY_FOLDERS.SERVICE);
            images.push(result.url);
            cloudinaryIds.push(result.publicId);
        }
    }
    const created = yield serviceAdmin_repository_1.serviceAdminRepository.createService({
        name: trimmedName,
        price: payload.price,
        duration: payload.duration,
        commission: (_b = payload.commission) !== null && _b !== void 0 ? _b : 0,
        availability: (_c = payload.availability) !== null && _c !== void 0 ? _c : true,
        includeServices: (_d = payload.includeServices) !== null && _d !== void 0 ? _d : [],
        excludeServices: (_e = payload.excludeServices) !== null && _e !== void 0 ? _e : [],
        images,
        cloudinaryIds,
        categoryId: parsedCategoryId,
        subCategoryId: parsedSubCategoryId,
    });
    (0, landingCache_util_1.clearLandingHomeCache)();
    (0, serviceAdminCache_util_1.clearServiceAdminCache)();
    return created;
});
exports.createService = createService;
/**
 * @name updateService
 * @description Updates service details and images (supports deletedImages); prevents duplicates within same category/sub-category; clears caches.
 * @access Private
 */
const updateService = (id, payload, files) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const item = yield serviceAdmin_repository_1.serviceAdminRepository.getServiceEntity(id);
    if (!item)
        throw new apiError_util_1.ApiError(enums_1.STATUS_CODE.NOT_FOUND, messages_1.MESSAGES.SERVICE.NOT_FOUND);
    let nextCategoryId = item.categoryId;
    let nextSubCategoryId = item.subCategoryId;
    if (payload.subCategoryId !== undefined) {
        const nextSub = yield serviceAdmin_repository_1.serviceAdminRepository.getSubCategoryById(payload.subCategoryId);
        if (!nextSub)
            throw new apiError_util_1.ApiError(enums_1.STATUS_CODE.NOT_FOUND, messages_1.MESSAGES.SUBCATEGORY.NOT_FOUND);
        nextSubCategoryId = nextSub.id;
        nextCategoryId = nextSub.categoryId;
    }
    const nextName = payload.name !== undefined ? payload.name.trim() : item.name;
    if (payload.name !== undefined && !nextName) {
        throw new apiError_util_1.ApiError(enums_1.STATUS_CODE.BAD_REQUEST, messages_1.MESSAGES.SERVICE.NAME_REQUIRED);
    }
    if (payload.name !== undefined || payload.subCategoryId !== undefined) {
        const dup = yield serviceAdmin_repository_1.serviceAdminRepository.findDuplicateService(nextCategoryId, nextSubCategoryId, nextName, item.id);
        if (dup) {
            throw new apiError_util_1.ApiError(enums_1.STATUS_CODE.CONFLICT, messages_1.MESSAGES.SERVICE.NAME_DUPLICATE_UNDER_SUBCATEGORY);
        }
    }
    // Important: clone arrays before mutating. Sequelize tracks previous values by reference,
    // so in-place mutation can result in changes not being persisted to DB.
    let images = Array.isArray(item.images) ? [...item.images] : [];
    let cloudinaryIds = Array.isArray(item.cloudinaryIds)
        ? [...item.cloudinaryIds]
        : [];
    if ((_a = payload.deletedImages) === null || _a === void 0 ? void 0 : _a.length) {
        const deleteSet = new Set(payload.deletedImages);
        const remainingImages = [];
        const remainingCloudinaryIds = [];
        for (let i = 0; i < cloudinaryIds.length; i++) {
            const publicId = cloudinaryIds[i];
            if (deleteSet.has(publicId)) {
                try {
                    yield (0, cloudinary_util_1.deleteImage)(publicId);
                }
                catch (_b) {
                    // ignore failure
                }
            }
            else {
                remainingCloudinaryIds.push(publicId);
                remainingImages.push(images[i]);
            }
        }
        images = remainingImages;
        cloudinaryIds = remainingCloudinaryIds;
    }
    if (files === null || files === void 0 ? void 0 : files.length) {
        for (const file of files) {
            const result = yield (0, cloudinary_util_1.uploadImage)(file, cloudinary_util_1.CLOUDINARY_FOLDERS.SERVICE);
            images.push(result.url);
            cloudinaryIds.push(result.publicId);
        }
    }
    yield serviceAdmin_repository_1.serviceAdminRepository.updateService(item, Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign({}, (payload.name !== undefined ? { name: nextName } : {})), (payload.price !== undefined ? { price: payload.price } : {})), (payload.duration !== undefined ? { duration: payload.duration } : {})), (payload.commission !== undefined
        ? { commission: payload.commission }
        : {})), (payload.availability !== undefined
        ? { availability: payload.availability }
        : {})), (payload.subCategoryId !== undefined
        ? { subCategoryId: nextSubCategoryId, categoryId: nextCategoryId }
        : {})), (payload.includeServices !== undefined
        ? { includeServices: payload.includeServices }
        : {})), (payload.excludeServices !== undefined
        ? { excludeServices: payload.excludeServices }
        : {})), (images !== undefined ? { images } : {})), (cloudinaryIds !== undefined ? { cloudinaryIds } : {})));
    (0, landingCache_util_1.clearLandingHomeCache)();
    (0, serviceAdminCache_util_1.clearServiceAdminCache)();
    return item;
});
exports.updateService = updateService;
/**
 * @name updateServiceAvailability
 * @description Updates a service availability flag and clears related caches.
 * @access Private
 */
const updateServiceAvailability = (id, availability) => __awaiter(void 0, void 0, void 0, function* () {
    const item = yield serviceAdmin_repository_1.serviceAdminRepository.getServiceEntity(id);
    if (!item)
        throw new apiError_util_1.ApiError(enums_1.STATUS_CODE.NOT_FOUND, messages_1.MESSAGES.SERVICE.NOT_FOUND);
    yield serviceAdmin_repository_1.serviceAdminRepository.updateService(item, { availability });
    (0, landingCache_util_1.clearLandingHomeCache)();
    (0, serviceAdminCache_util_1.clearServiceAdminCache)();
    return item;
});
exports.updateServiceAvailability = updateServiceAvailability;
/**
 * @name deleteService
 * @description Deletes a service and associated Cloudinary images (when present) and clears related caches.
 * @access Private
 */
const deleteService = (id) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const item = yield serviceAdmin_repository_1.serviceAdminRepository.getServiceEntity(id);
    if (!item)
        throw new apiError_util_1.ApiError(enums_1.STATUS_CODE.NOT_FOUND, messages_1.MESSAGES.SERVICE.NOT_FOUND);
    for (const publicId of (_a = item.cloudinaryIds) !== null && _a !== void 0 ? _a : []) {
        try {
            yield (0, cloudinary_util_1.deleteImage)(publicId);
        }
        catch (_b) {
            // ignore
        }
    }
    yield serviceAdmin_repository_1.serviceAdminRepository.deleteService(item);
    (0, landingCache_util_1.clearLandingHomeCache)();
    (0, serviceAdminCache_util_1.clearServiceAdminCache)();
});
exports.deleteService = deleteService;
