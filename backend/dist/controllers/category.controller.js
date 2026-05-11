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
exports.bulkCreate = exports.deleteCategory = exports.createCategory = exports.getCategoriesMultiple = exports.getCategories = void 0;
const CategoryService = __importStar(require("../services/category.service"));
const logger_1 = __importDefault(require("../utils/logger"));
const cloudinary_util_1 = require("../utils/cloudinary.util");
const apiError_util_1 = require("../utils/apiError.util");
const response_util_1 = require("../utils/response.util");
const models_1 = require("../models");
const userRole_enum_1 = require("../enums/userRole.enum");
const messages_1 = require("../constants/messages");
const enums_1 = require("../enums");
const common_utils_1 = require("../utils/common.utils");
/**
 * Get Categories by Service Type ID
 */
const getCategories = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { serviceTypeId } = req.params;
        const { excludeEmpty } = req.query;
        const data = yield CategoryService.getCategoriesByServiceType(serviceTypeId, excludeEmpty === 'true');
        return (0, response_util_1.sendResponse)(res, messages_1.MESSAGES.CATEGORY.FETCHED, data);
    }
    catch (error) {
        logger_1.default.error(`Login error: ${(0, common_utils_1.getErrorMessage)(error)}`);
        next(error);
    }
});
exports.getCategories = getCategories;
/**
 * Get Categories by multiple Service Type IDs
 * Query: ?ids=1,2,3&excludeEmpty=true
 */
const getCategoriesMultiple = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { ids, excludeEmpty } = req.query;
        if (!ids || typeof ids !== 'string') {
            return (0, response_util_1.sendError)(res, 'Query parameter "ids" is required (comma-separated service type IDs)', enums_1.STATUS_CODE.BAD_REQUEST);
        }
        const serviceTypeIds = ids
            .split(',')
            .map((id) => id.trim())
            .filter(Boolean);
        if (serviceTypeIds.length === 0) {
            return (0, response_util_1.sendError)(res, 'At least one service type ID is required', enums_1.STATUS_CODE.BAD_REQUEST);
        }
        const data = yield CategoryService.getCategoriesByMultipleServiceTypes(serviceTypeIds, excludeEmpty === 'true');
        return (0, response_util_1.sendResponse)(res, messages_1.MESSAGES.CATEGORY.FETCHED, data);
    }
    catch (error) {
        logger_1.default.error(`getCategoriesMultiple error: ${(0, common_utils_1.getErrorMessage)(error)}`);
        next(error);
    }
});
exports.getCategoriesMultiple = getCategoriesMultiple;
/**
 * Add a new Category
 */
const createCategory = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const partnerId = ((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) === userRole_enum_1.UserRole.SERVICE_PARTNER ? req.user.id : undefined;
    if (partnerId) {
        throw new apiError_util_1.ApiError(enums_1.STATUS_CODE.FORBIDDEN, messages_1.MESSAGES.CATEGORY.ADMIN_ONLY_CREATE);
    }
    try {
        logger_1.default.info("Create Category request");
        const { serviceTypeId } = req.params;
        const { name } = req.body;
        if (!req.file) {
            throw new apiError_util_1.ApiError(400, "Image is mandatory");
        }
        const uploadResult = yield (0, cloudinary_util_1.uploadImage)(req.file, `${cloudinary_util_1.CLOUDINARY_FOLDERS.SERVICE_TYPE}/categories`);
        const data = yield CategoryService.createCategory(serviceTypeId, name.trim(), uploadResult.url, uploadResult.publicId);
        return (0, response_util_1.sendResponse)(res, messages_1.MESSAGES.CATEGORY.CREATED, data, enums_1.STATUS_CODE.CREATED);
    }
    catch (error) {
        logger_1.default.error(`Login error: ${(0, common_utils_1.getErrorMessage)(error)}`);
        next(error);
    }
});
exports.createCategory = createCategory;
/**
 * Delete a Category
 */
const deleteCategory = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const partnerId = ((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) === userRole_enum_1.UserRole.SERVICE_PARTNER ? req.user.id : undefined;
    if (partnerId) {
        throw new apiError_util_1.ApiError(enums_1.STATUS_CODE.FORBIDDEN, messages_1.MESSAGES.CATEGORY.ADMIN_ONLY_DELETE);
    }
    try {
        const { id } = req.params;
        yield CategoryService.deleteCategory(id);
        return (0, response_util_1.sendResponse)(res, messages_1.MESSAGES.CATEGORY.DELETED);
    }
    catch (error) {
        logger_1.default.error(`Login error: ${(0, common_utils_1.getErrorMessage)(error)}`);
        next(error);
    }
});
exports.deleteCategory = deleteCategory;
/**
 * Bulk Create Categories and Subcategories
 */
const bulkCreate = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d;
    const partnerId = ((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) === userRole_enum_1.UserRole.SERVICE_PARTNER ? req.user.id : undefined;
    if (partnerId) {
        throw new apiError_util_1.ApiError(enums_1.STATUS_CODE.FORBIDDEN, messages_1.MESSAGES.CATEGORY.ADMIN_ONLY_CREATE);
    }
    try {
        // ── 0. Validate serviceTypeId ─────────────────────────────
        const rawServiceTypeId = req.params.serviceTypeId;
        const serviceTypeId = Array.isArray(rawServiceTypeId)
            ? rawServiceTypeId[0]
            : rawServiceTypeId;
        const parsedServiceTypeId = parseInt(serviceTypeId, 10);
        if (isNaN(parsedServiceTypeId)) {
            throw new apiError_util_1.ApiError(enums_1.STATUS_CODE.BAD_REQUEST, messages_1.MESSAGES.SERVICE_TYPE.INVALID_ID);
        }
        const item = yield models_1.ServiceType.findByPk(parsedServiceTypeId);
        if (!item)
            throw new apiError_util_1.ApiError(enums_1.STATUS_CODE.NOT_FOUND, messages_1.MESSAGES.SERVICE_TYPE.NOT_FOUND);
        // ── 1. Parse categories ───────────────────────────────────
        let categories = req.body.categories;
        if (typeof categories === "string") {
            try {
                categories = JSON.parse(categories);
            }
            catch (_e) {
                throw new apiError_util_1.ApiError(enums_1.STATUS_CODE.BAD_REQUEST, messages_1.MESSAGES.CATEGORY.INVALID_FORMAT);
            }
        }
        if (!Array.isArray(categories)) {
            throw new apiError_util_1.ApiError(enums_1.STATUS_CODE.BAD_REQUEST, messages_1.MESSAGES.CATEGORY.MUST_BE_ARRAY);
        }
        // ── 2. Normalize + Deduplicate (NO THROW) ─────────────────
        const catSeen = new Set();
        const skippedInRequest = [];
        const cleanedCategories = [];
        for (const rawCat of categories) {
            const catName = (_b = rawCat.name) === null || _b === void 0 ? void 0 : _b.trim();
            if (!catName)
                continue;
            const key = catName.toLowerCase();
            if (catSeen.has(key)) {
                skippedInRequest.push(catName);
                continue;
            }
            catSeen.add(key);
            // clone object (avoid mutation)
            const cat = Object.assign(Object.assign({}, rawCat), { name: catName, subCategories: [] });
            // subcategory dedup
            if ((_c = rawCat.subCategories) === null || _c === void 0 ? void 0 : _c.length) {
                const subSeen = new Set();
                for (const rawSub of rawCat.subCategories) {
                    const subName = (_d = rawSub.name) === null || _d === void 0 ? void 0 : _d.trim();
                    if (!subName)
                        continue;
                    const subKey = subName.toLowerCase();
                    if (subSeen.has(subKey))
                        continue;
                    subSeen.add(subKey);
                    cat.subCategories.push(Object.assign(Object.assign({}, rawSub), { name: subName }));
                }
            }
            cleanedCategories.push(cat);
        }
        // ── 3. File mapping ───────────────────────────────────────
        const files = req.files;
        const fileMap = {};
        if (Array.isArray(files)) {
            files.forEach((f) => (fileMap[f.fieldname] = f));
        }
        else if (files && typeof files === "object") {
            Object.entries(files).forEach(([key, arr]) => {
                if (Array.isArray(arr) && arr[0])
                    fileMap[key] = arr[0];
            });
        }
        // ── 4. Upload queue ───────────────────────────────────────
        const uploadQueue = [];
        cleanedCategories.forEach((cat) => {
            var _a, _b;
            if ((_a = cat.imageUrl) === null || _a === void 0 ? void 0 : _a.startsWith("data:image/")) {
                uploadQueue.push({ file: cat.imageUrl, target: cat, folder: "categories" });
            }
            else if (cat.image && fileMap[cat.image]) {
                uploadQueue.push({ file: fileMap[cat.image], target: cat, folder: "categories" });
            }
            else if (cat.image && typeof cat.image === "string" && cat.image.startsWith("http")) {
                // It's an existing URL sent in the image field
                cat.imageUrl = cat.image;
            }
            if (!cat.imageUrl && !cat.image) {
                throw new apiError_util_1.ApiError(400, `Image is mandatory for category: ${cat.name}`);
            }
            (_b = cat.subCategories) === null || _b === void 0 ? void 0 : _b.forEach((sub) => {
                var _a;
                if ((_a = sub.imageUrl) === null || _a === void 0 ? void 0 : _a.startsWith("data:image/")) {
                    uploadQueue.push({ file: sub.imageUrl, target: sub, folder: "sub_categories" });
                }
                else if (sub.image && fileMap[sub.image]) {
                    uploadQueue.push({ file: fileMap[sub.image], target: sub, folder: "sub_categories" });
                }
                else if (sub.image && typeof sub.image === "string" && sub.image.startsWith("http")) {
                    // It's an existing URL sent in the image field
                    sub.imageUrl = sub.image;
                }
                if (!sub.imageUrl && !sub.image) {
                    throw new apiError_util_1.ApiError(400, `Image is mandatory for sub-category: ${sub.name}`);
                }
            });
        });
        // ── 5. Safe concurrency upload ────────────────────────────
        const CONCURRENCY = 5;
        for (let i = 0; i < uploadQueue.length; i += CONCURRENCY) {
            const batch = uploadQueue.slice(i, i + CONCURRENCY);
            yield Promise.all(batch.map((task) => __awaiter(void 0, void 0, void 0, function* () {
                const result = yield (0, cloudinary_util_1.uploadImage)(task.file, `${cloudinary_util_1.CLOUDINARY_FOLDERS.SERVICE_TYPE}/${task.folder}`);
                task.target.imageUrl = result.url;
                task.target.cloudinaryId = result.publicId;
            })));
        }
        // ── 6. Call service ───────────────────────────────────────
        const result = yield CategoryService.bulkUpsertCategories(parsedServiceTypeId, cleanedCategories);
        return (0, response_util_1.sendResponse)(res, {
            message: messages_1.MESSAGES.CATEGORY.BULK_UPSERT_COMPLETED,
            stats: Object.assign(Object.assign({}, result.stats), { skippedInRequest }),
        });
    }
    catch (error) {
        logger_1.default.error(`Login error: ${(0, common_utils_1.getErrorMessage)(error)}`);
        next(error);
    }
});
exports.bulkCreate = bulkCreate;
