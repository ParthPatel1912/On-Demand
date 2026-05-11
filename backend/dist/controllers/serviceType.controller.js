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
exports.getAllHierarchy = exports.remove = exports.update = exports.listServices = exports.getById = exports.getPublicUserAllService = exports.getAll = exports.create = void 0;
const service = __importStar(require("../services/serviceType.service"));
const logger_1 = __importDefault(require("../utils/logger"));
const common_utils_1 = require("../utils/common.utils");
const userRole_enum_1 = require("../enums/userRole.enum");
const response_util_1 = require("../utils/response.util");
const apiError_util_1 = require("../utils/apiError.util");
const messages_1 = require("../constants/messages");
const enums_1 = require("../enums");
/**
 * Create Service Type
 */
const create = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const partnerId = ((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) === userRole_enum_1.UserRole.SERVICE_PARTNER ? req.user.id : undefined;
    if (partnerId) {
        throw new apiError_util_1.ApiError(enums_1.STATUS_CODE.FORBIDDEN, messages_1.MESSAGES.SERVICE_TYPE.ADMIN_ONLY_CREATE);
    }
    try {
        logger_1.default.info("Create ServiceType request");
        const files = req.files;
        const image = (files === null || files === void 0 ? void 0 : files.image) ? files.image[0] : undefined;
        const bannerImage = (files === null || files === void 0 ? void 0 : files.bannerImage) ? files.bannerImage[0] : undefined;
        const data = yield service.createServiceType(req.body.name.trim(), image, bannerImage);
        return (0, response_util_1.sendResponse)(res, messages_1.MESSAGES.SERVICE.CREATED, data, enums_1.STATUS_CODE.CREATED);
    }
    catch (err) {
        logger_1.default.error((0, common_utils_1.getErrorMessage)(err));
        next(err);
    }
});
exports.create = create;
/**
 * Get all Service Types
 */
const getAll = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = yield service.getServiceTypes({
            page: (0, common_utils_1.parseNumber)(req.query.page),
            limit: (0, common_utils_1.parseNumber)(req.query.limit),
        });
        return (0, response_util_1.sendResponse)(res, Object.assign({}, data));
    }
    catch (err) {
        logger_1.default.error((0, common_utils_1.getErrorMessage)(err));
        next(err);
    }
});
exports.getAll = getAll;
/**
 * As Public Users Get all Service Types
 */
const getPublicUserAllService = (_req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = yield service.getAllServiceTypes();
        return (0, response_util_1.sendResponse)(res, undefined, data);
    }
    catch (err) {
        logger_1.default.error((0, common_utils_1.getErrorMessage)(err));
        next(err);
    }
});
exports.getPublicUserAllService = getPublicUserAllService;
/**
 * Get Service Type by ID
 */
const getById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = yield service.getServiceTypeById(req.params.id);
        return (0, response_util_1.sendResponse)(res, undefined, data);
    }
    catch (err) {
        logger_1.default.error((0, common_utils_1.getErrorMessage)(err));
        next(err);
    }
});
exports.getById = getById;
/**
 * GET /api/service-types/:id/services
 * Get services for a specific service type with search, subcategory filtering and load more
 * Route parameters:
 * - id: Service Type ID
 * Query parameters:
 * - q: Search term for service name
 * - subCategoryId: Filter by sub-category ID
 * - offset: Offset for load more functionality (default: 0)
 * - limit: Number of items to return (default: 12, max: 50)
 */
const listServices = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = yield service.getPublicServices(req.params.id, {
            q: typeof req.query.q === "string" ? req.query.q : undefined,
            subCategoryId: (0, common_utils_1.parseNumber)(req.query.subCategoryId),
            offset: (0, common_utils_1.parseNumber)(req.query.offset),
            limit: (0, common_utils_1.parseNumber)(req.query.limit),
        });
        return (0, response_util_1.sendResponse)(res, Object.assign({}, data));
    }
    catch (err) {
        logger_1.default.error((0, common_utils_1.getErrorMessage)(err));
        next(err);
    }
});
exports.listServices = listServices;
/**
 * Update Service Type
 */
const update = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const partnerId = ((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) === userRole_enum_1.UserRole.SERVICE_PARTNER ? req.user.id : undefined;
    if (partnerId) {
        throw new apiError_util_1.ApiError(enums_1.STATUS_CODE.FORBIDDEN, messages_1.MESSAGES.SERVICE_TYPE.ADMIN_ONLY_UPDATE);
    }
    try {
        const files = req.files;
        const image = (files === null || files === void 0 ? void 0 : files.image) ? files.image[0] : undefined;
        const bannerImage = (files === null || files === void 0 ? void 0 : files.bannerImage) ? files.bannerImage[0] : undefined;
        const data = yield service.updateServiceType(req.params.id, (_b = req.body.name) === null || _b === void 0 ? void 0 : _b.trim(), image, bannerImage);
        return (0, response_util_1.sendResponse)(res, messages_1.MESSAGES.SERVICE_TYPE.UPDATED, data);
    }
    catch (err) {
        logger_1.default.error((0, common_utils_1.getErrorMessage)(err));
        next(err);
    }
});
exports.update = update;
/**
 * Delete Service Type
 */
const remove = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const partnerId = ((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) === userRole_enum_1.UserRole.SERVICE_PARTNER ? req.user.id : undefined;
    if (partnerId) {
        throw new apiError_util_1.ApiError(enums_1.STATUS_CODE.FORBIDDEN, messages_1.MESSAGES.SERVICE_TYPE.ADMIN_ONLY_DELETE);
    }
    try {
        yield service.deleteServiceType(req.params.id);
        return (0, response_util_1.sendResponse)(res, messages_1.MESSAGES.SERVICE_TYPE.DELETED);
    }
    catch (err) {
        logger_1.default.error((0, common_utils_1.getErrorMessage)(err));
        next(err);
    }
});
exports.remove = remove;
/**
 * Get all Service Types with nested Categories + SubCategories
 */
const getAllHierarchy = (_req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const partnerId = ((_a = _req.user) === null || _a === void 0 ? void 0 : _a.role) === userRole_enum_1.UserRole.SERVICE_PARTNER ? _req.user.id : undefined;
        let data;
        if (!partnerId) {
            data = yield service.getServiceTypesHierarchy();
        }
        else {
            data = yield service.getPartnerServiceTypesHierarchy(partnerId);
        }
        return (0, response_util_1.sendResponse)(res, undefined, data);
    }
    catch (err) {
        logger_1.default.error((0, common_utils_1.getErrorMessage)(err));
        next(err);
    }
});
exports.getAllHierarchy = getAllHierarchy;
