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
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteRole = exports.updateRole = exports.createRole = exports.listRoles = void 0;
const apiError_util_1 = require("../utils/apiError.util");
const RoleRepository = __importStar(require("../repositories/role.repository"));
const sequelize_1 = require("sequelize");
const enums_1 = require("../enums");
const messages_1 = require("../constants/messages");
/**
 * @name listRoles
 * @description Fetch roles with filtering and sorting.
 */
const listRoles = (query) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const where = ((_a = query.search) === null || _a === void 0 ? void 0 : _a.trim())
        ? {
            [sequelize_1.Op.or]: [
                { name: { [sequelize_1.Op.iLike]: `%${query.search.trim()}%` } },
                { description: { [sequelize_1.Op.iLike]: `%${query.search.trim()}%` } },
            ],
        }
        : {};
    const allowedSortFields = ["id", "name", "createdAt"];
    const sortBy = allowedSortFields.includes(query.sortBy || "") ? query.sortBy : "createdAt";
    const sortOrder = query.sortOrder === "ASC" ? "ASC" : "DESC";
    const rows = yield RoleRepository.findAllRoles({
        where,
        sortBy: sortBy,
        sortOrder,
    });
    return {
        data: rows,
    };
});
exports.listRoles = listRoles;
/**
 * @name createRole
 * @description Create a new role.
 */
const createRole = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const existingRole = yield RoleRepository.findRoleByName(payload.name);
    if (existingRole) {
        throw new apiError_util_1.ApiError(enums_1.STATUS_CODE.BAD_REQUEST, messages_1.MESSAGES.ROLE.NAME_EXISTS);
    }
    return yield RoleRepository.createRole(payload);
});
exports.createRole = createRole;
/**
 * @name updateRole
 * @description Update an existing role.
 */
const updateRole = (id, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const role = yield RoleRepository.findRoleById(id);
    if (!role) {
        throw new apiError_util_1.ApiError(enums_1.STATUS_CODE.NOT_FOUND, messages_1.MESSAGES.ROLE.NOT_FOUND);
    }
    if (payload.name && payload.name !== role.name) {
        const existingRole = yield RoleRepository.findRoleByName(payload.name);
        if (existingRole) {
            throw new apiError_util_1.ApiError(enums_1.STATUS_CODE.BAD_REQUEST, messages_1.MESSAGES.ROLE.NAME_EXISTS);
        }
    }
    return yield RoleRepository.updateRole(id, payload);
});
exports.updateRole = updateRole;
/**
 * @name deleteRole
 * @description Delete a role by id.
 */
const deleteRole = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const role = yield RoleRepository.findRoleById(id);
    if (!role) {
        throw new apiError_util_1.ApiError(enums_1.STATUS_CODE.NOT_FOUND, messages_1.MESSAGES.ROLE.NOT_FOUND);
    }
    yield RoleRepository.deleteRole(id);
});
exports.deleteRole = deleteRole;
