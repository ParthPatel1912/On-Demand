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
exports.deleteAdminUser = exports.updateAdminUser = exports.createAdminUser = exports.listAdmins = void 0;
const AdminUserService = __importStar(require("../services/adminUser.service"));
const logger_1 = __importDefault(require("../utils/logger"));
const response_util_1 = require("../utils/response.util");
const messages_1 = require("../constants/messages");
const enums_1 = require("../enums");
const common_utils_1 = require("../utils/common.utils");
/**
 * @name listAdmins
 * @description
 * Fetch admin users with pagination, filtering and sorting.
 * Supports searching by name or email, and filtering by active status.
 * @access Private | Role-based
 */
const listAdmins = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { page, limit, sortBy, sortOrder, search, status } = req.query;
        const data = yield AdminUserService.listAdminUsers({
            page: page || 1,
            limit: limit || 10,
            sortBy: sortBy,
            sortOrder: sortOrder || "DESC",
            search: search,
            status: status,
        });
        return (0, response_util_1.sendResponse)(res, Object.assign({}, data));
    }
    catch (error) {
        logger_1.default.error((0, common_utils_1.getErrorMessage)(error));
        next(error);
    }
});
exports.listAdmins = listAdmins;
/**
 * @name createAdminUser
 * @description
 * Create a new admin user with the provided details.
 * Sends an email with credentials to the new admin user.
 * @access Private | Role-based
 */
const createAdminUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        logger_1.default.info("AdminUserController: Create user request");
        const data = yield AdminUserService.createAdminUser(req.body);
        return (0, response_util_1.sendResponse)(res, messages_1.MESSAGES.USER.CREATED, data, enums_1.STATUS_CODE.CREATED);
    }
    catch (error) {
        logger_1.default.error((0, common_utils_1.getErrorMessage)(error));
        next(error);
    }
});
exports.createAdminUser = createAdminUser;
/**
 * @name updateAdminUser
 * @description
 * Update an existing admin user's details by ID.
 * Supports updating name, email, password and active status.
 * @access Private | Role-based
 */
const updateAdminUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        logger_1.default.info(`AdminUserController: Update user request for id: ${req.params.id}`);
        const data = yield AdminUserService.updateAdminUser(req.params.id, req.body);
        return (0, response_util_1.sendResponse)(res, messages_1.MESSAGES.USER.UPDATED, data);
    }
    catch (error) {
        logger_1.default.error((0, common_utils_1.getErrorMessage)(error));
        next(error);
    }
});
exports.updateAdminUser = updateAdminUser;
/**
 * @name deleteAdminUser
 * @description
 * Delete an admin user by ID.
 * @access Private | Role-based
 */
const deleteAdminUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        logger_1.default.info(`AdminUserController: Delete user request for id: ${req.params.id}`);
        yield AdminUserService.deleteAdminUser(req.params.id);
        return (0, response_util_1.sendResponse)(res, messages_1.MESSAGES.USER.DELETED);
    }
    catch (error) {
        logger_1.default.error((0, common_utils_1.getErrorMessage)(error));
        next(error);
    }
});
exports.deleteAdminUser = deleteAdminUser;
