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
exports.remove = exports.updateAvailability = exports.update = exports.create = exports.getServiceByIdForAdmin = exports.getServiceById = exports.listByCategory = void 0;
const service = __importStar(require("../services/serviceAdmin.service"));
const logger_1 = __importDefault(require("../utils/logger"));
const common_utils_1 = require("../utils/common.utils");
const response_util_1 = require("../utils/response.util");
const messages_1 = require("../constants/messages");
const enums_1 = require("../enums");
/**
 * GET /api/categories/:categoryId/services
 * Query:
 * - q
 * - page, limit
 * - subCategoryId
 * - priceMin, priceMax
 * - availability (yes/no)
 * - commission
 */
const listByCategory = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { categoryId } = req.params;
        const data = yield service.listServicesByCategory(categoryId, {
            q: typeof req.query.q === "string" ? req.query.q : undefined,
            page: (0, common_utils_1.parseNumber)(req.query.page),
            limit: (0, common_utils_1.parseNumber)(req.query.limit),
            subCategoryId: (0, common_utils_1.parseNumber)(req.query.subCategoryId),
            priceMin: (0, common_utils_1.parseNumber)(req.query.priceMin),
            priceMax: (0, common_utils_1.parseNumber)(req.query.priceMax),
            availability: (0, common_utils_1.parseAvailability)(req.query.availability),
            commission: (0, common_utils_1.parseNumber)(req.query.commission),
        });
        return (0, response_util_1.sendResponse)(res, Object.assign({}, data));
    }
    catch (err) {
        logger_1.default.error((0, common_utils_1.getErrorMessage)(err));
        next(err);
    }
});
exports.listByCategory = listByCategory;
/**
 * GET /api/services/:id
 */
const getServiceById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const serviceData = yield service.getService(req.params.id, { isAdmin: false });
        return (0, response_util_1.sendResponse)(res, undefined, serviceData);
    }
    catch (err) {
        logger_1.default.error((0, common_utils_1.getErrorMessage)(err));
        next(err);
    }
});
exports.getServiceById = getServiceById;
/**
 * GET /api/services/:id for admin
 */
const getServiceByIdForAdmin = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const serviceData = yield service.getService(req.params.id, { isAdmin: true });
        return (0, response_util_1.sendResponse)(res, undefined, serviceData);
    }
    catch (err) {
        logger_1.default.error((0, common_utils_1.getErrorMessage)(err));
        next(err);
    }
});
exports.getServiceByIdForAdmin = getServiceByIdForAdmin;
/**
 * POST /api/subcategories/:subCategoryId/services
 */
const create = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    try {
        const { categoryId, subCategoryId } = req.params;
        const effectiveCategoryId = categoryId !== null && categoryId !== void 0 ? categoryId : req.body.categoryId;
        const files = ((_a = req.files) !== null && _a !== void 0 ? _a : []);
        const data = yield service.createService(effectiveCategoryId, subCategoryId, {
            name: req.body.name,
            price: req.body.price,
            duration: (0, common_utils_1.parseNumber)(req.body.duration),
            commission: req.body.commission,
            availability: req.body.availability,
            includeServices: (_b = (0, common_utils_1.parseStringArray)(req.body.includeServices)) !== null && _b !== void 0 ? _b : [],
            excludeServices: (_c = (0, common_utils_1.parseStringArray)(req.body.excludeServices)) !== null && _c !== void 0 ? _c : [],
        }, files);
        return (0, response_util_1.sendResponse)(res, messages_1.MESSAGES.SERVICE.CREATED, data, enums_1.STATUS_CODE.CREATED);
    }
    catch (err) {
        logger_1.default.error((0, common_utils_1.getErrorMessage)(err));
        next(err);
    }
});
exports.create = create;
/**
 * PUT /api/services/:id
 */
const update = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const files = ((_a = req.files) !== null && _a !== void 0 ? _a : []);
        const data = yield service.updateService(req.params.id, {
            name: req.body.name,
            price: req.body.price,
            duration: (0, common_utils_1.parseNumber)(req.body.duration),
            commission: req.body.commission,
            availability: req.body.availability,
            subCategoryId: (0, common_utils_1.parseNumber)(req.body.subCategoryId),
            includeServices: (0, common_utils_1.parseStringArray)(req.body.includeServices),
            excludeServices: (0, common_utils_1.parseStringArray)(req.body.excludeServices),
            deletedImages: (0, common_utils_1.parseStringArray)(req.body.deletedImages),
        }, files);
        return (0, response_util_1.sendResponse)(res, messages_1.MESSAGES.SERVICE.UPDATED, data);
    }
    catch (err) {
        logger_1.default.error((0, common_utils_1.getErrorMessage)(err));
        next(err);
    }
});
exports.update = update;
/**
 * PATCH /api/services/:id/availability
 */
const updateAvailability = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = yield service.updateServiceAvailability(req.params.id, req.body.availability);
        return (0, response_util_1.sendResponse)(res, messages_1.MESSAGES.SERVICE.AVAILABILITY_UPDATED, data);
    }
    catch (err) {
        logger_1.default.error((0, common_utils_1.getErrorMessage)(err));
        next(err);
    }
});
exports.updateAvailability = updateAvailability;
/**
 * DELETE /api/services/:id
 */
const remove = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield service.deleteService(req.params.id);
        return (0, response_util_1.sendResponse)(res, messages_1.MESSAGES.SERVICE.DELETED);
    }
    catch (err) {
        logger_1.default.error((0, common_utils_1.getErrorMessage)(err));
        next(err);
    }
});
exports.remove = remove;
