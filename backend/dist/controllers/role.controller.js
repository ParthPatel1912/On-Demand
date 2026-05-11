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
exports.deleteRole = exports.updateRole = exports.createRole = exports.listRoles = void 0;
const RoleService = __importStar(require("../services/role.service"));
const logger_1 = __importDefault(require("../utils/logger"));
const response_util_1 = require("../utils/response.util");
const messages_1 = require("../constants/messages");
const enums_1 = require("../enums");
const common_utils_1 = require("../utils/common.utils");
/**
 * @name listRoles
 * @description Fetch roles with filtering and sorting.
 * @access Private | Role-based
 */
const listRoles = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { sortBy, sortOrder, search } = req.query;
        const data = yield RoleService.listRoles({
            sortBy: sortBy,
            sortOrder: sortOrder || "DESC",
            search: search,
        });
        return (0, response_util_1.sendResponse)(res, Object.assign({}, data));
    }
    catch (error) {
        logger_1.default.error(`Login error: ${(0, common_utils_1.getErrorMessage)(error)}`);
        next(error);
    }
});
exports.listRoles = listRoles;
/**
 * @name createRole
 * @description Create a new role.
 * @access Private | Role-based
 */
const createRole = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        logger_1.default.info("RoleController: Create role request");
        const data = yield RoleService.createRole(req.body);
        return (0, response_util_1.sendResponse)(res, messages_1.MESSAGES.ROLE.CREATED, data, enums_1.STATUS_CODE.CREATED);
    }
    catch (error) {
        logger_1.default.error(`Login error: ${(0, common_utils_1.getErrorMessage)(error)}`);
        next(error);
    }
});
exports.createRole = createRole;
/**
 * @name updateRole
 * @description Update an existing role.
 * @access Private | Role-based
 */
const updateRole = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        logger_1.default.info(`RoleController: Update role request for id: ${req.params.id}`);
        const data = yield RoleService.updateRole(req.params.id, req.body);
        return (0, response_util_1.sendResponse)(res, messages_1.MESSAGES.ROLE.UPDATED, data);
    }
    catch (error) {
        logger_1.default.error(`Login error: ${(0, common_utils_1.getErrorMessage)(error)}`);
        next(error);
    }
});
exports.updateRole = updateRole;
/**
 * @name deleteRole
 * @description Delete a role by ID.
 * @access Private | Role-based
 */
const deleteRole = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        logger_1.default.info(`RoleController: Delete role request for id: ${req.params.id}`);
        yield RoleService.deleteRole(req.params.id);
        return (0, response_util_1.sendResponse)(res, messages_1.MESSAGES.ROLE.DELETED);
    }
    catch (error) {
        logger_1.default.error(`Login error: ${(0, common_utils_1.getErrorMessage)(error)}`);
        next(error);
    }
});
exports.deleteRole = deleteRole;
