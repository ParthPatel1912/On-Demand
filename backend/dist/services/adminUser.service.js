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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteAdminUser = exports.updateAdminUser = exports.createAdminUser = exports.listAdminUsers = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const sequelize_1 = require("sequelize");
const apiError_util_1 = require("../utils/apiError.util");
const logger_1 = __importDefault(require("../utils/logger"));
const mail_util_1 = require("../utils/mail.util");
const AdminUserRepository = __importStar(require("../repositories/adminUser.repository"));
const messages_1 = require("../constants/messages");
const enums_1 = require("../enums");
/**
 * @name listAdminUsers
 * @description
 * List admin users with pagination, filtering and sorting.
 * Supports searching by name or email.
 * @access Private | Role-based
 */
const listAdminUsers = (query) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const page = Math.max(1, Number(query.page || 1));
    const limit = Math.max(1, Math.min(100, Number(query.limit || 10)));
    const offset = (page - 1) * limit;
    const where = {};
    // Search by name or email
    if ((_a = query.search) === null || _a === void 0 ? void 0 : _a.trim()) {
        const search = `%${query.search.trim()}%`;
        Object.assign(where, {
            [sequelize_1.Op.or]: [
                { name: { [sequelize_1.Op.iLike]: search } },
                { email: { [sequelize_1.Op.iLike]: search } },
            ]
        });
    }
    if (query.status !== undefined) {
        where.isActive = query.status === "active";
    }
    // Sorting
    const allowedSortFields = ["id", "name", "email", "createdAt", "status"];
    const sortBy = allowedSortFields.includes(query.sortBy || "")
        ? query.sortBy === "status"
            ? "isActive"
            : query.sortBy
        : "createdAt";
    const sortOrder = query.sortOrder === "ASC" ? "ASC" : "DESC";
    const adminRoleId = yield AdminUserRepository.getAdminRoleId();
    if (!adminRoleId) {
        throw new apiError_util_1.ApiError(enums_1.STATUS_CODE.INTERNAL_SERVER_ERROR, messages_1.MESSAGES.USER.ADMIN_ROLE_NOT_CONFIGURED);
    }
    logger_1.default.info(`AdminUserService: Fetching admins with page: ${page}, limit: ${limit}, filtering: ${JSON.stringify(where)}, sorting: ${sortBy} ${sortOrder}`);
    const { rows, count } = yield AdminUserRepository.findAllAdmins({
        page,
        limit,
        offset,
        where,
        sortBy: sortBy,
        sortOrder,
        adminRoleId,
    });
    return {
        data: rows,
        pagination: {
            currentPage: page,
            limit,
            totalItems: count,
            totalPages: Math.ceil(count / limit),
        },
    };
});
exports.listAdminUsers = listAdminUsers;
/**
 * @name createAdminUser
 * @description
 * Create admin user with unique email and mobile number.
 * @access Private | Role-based
 */
const createAdminUser = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const { email } = payload;
    const adminRoleId = yield AdminUserRepository.getAdminRoleId();
    if (!adminRoleId) {
        throw new apiError_util_1.ApiError(enums_1.STATUS_CODE.INTERNAL_SERVER_ERROR, messages_1.MESSAGES.USER.ADMIN_ROLE_NOT_CONFIGURED);
    }
    const activeUser = yield AdminUserRepository.findAdminByEmail(email, true);
    if (activeUser && activeUser.getDataValue("deletedAt") === null) {
        throw new apiError_util_1.ApiError(enums_1.STATUS_CODE.BAD_REQUEST, messages_1.MESSAGES.USER.ALREADY_EXISTS);
    }
    const deletedUser = yield AdminUserRepository.findAdminByEmail(email, false);
    if (deletedUser && deletedUser.getDataValue("deletedAt") !== null) {
        yield AdminUserRepository.hardDeleteAdmin(deletedUser.id);
    }
    const { confirmPassword, password } = payload, rest = __rest(payload, ["confirmPassword", "password"]);
    if (!password) {
        throw new apiError_util_1.ApiError(400, "Password is required");
    }
    let hashedPassword = yield bcrypt_1.default.hash(password, 10);
    // Laravel expects $2y$ prefix for Bcrypt hashes (Node uses $2b$ by default)
    hashedPassword = hashedPassword.replace(/^\$2[ab]\$/, "$2y$");
    const admin = yield AdminUserRepository.createAdmin(Object.assign(Object.assign({}, rest), { password: hashedPassword, roleId: adminRoleId, isActive: payload.isActive !== undefined ? payload.isActive : true }));
    // we use the original 'password' from the payload, not the hashed one
    try {
        yield (0, mail_util_1.sendAdminCredentials)(admin.email, admin.name, password);
    }
    catch (emailError) {
        logger_1.default.error("Failed to send welcome email to new admin:", emailError);
        // Continue despite email failure
    }
    const adminData = admin.toJSON();
    delete adminData.password;
    return adminData;
});
exports.createAdminUser = createAdminUser;
/**
 * @name updateAdminUser
 * @description
 * Update admin user with name, email and mobile number.
 * @access Private | Role-based
 */
const updateAdminUser = (id, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const admin = yield AdminUserRepository.findAdminById(id);
    if (!admin) {
        throw new apiError_util_1.ApiError(enums_1.STATUS_CODE.NOT_FOUND, messages_1.MESSAGES.USER.ADMIN_NOT_FOUND);
    }
    if (payload.email && payload.email !== admin.email) {
        const { email } = payload;
        const activeUser = yield AdminUserRepository.findAdminByEmail(email, true);
        if (activeUser && activeUser.getDataValue("deletedAt") === null) {
            throw new apiError_util_1.ApiError(enums_1.STATUS_CODE.BAD_REQUEST, messages_1.MESSAGES.USER.USER_EMAIL_EXISTS);
        }
        const deletedUser = yield AdminUserRepository.findAdminByEmail(email, false);
        if (deletedUser && deletedUser.getDataValue("deletedAt") !== null) {
            yield AdminUserRepository.hardDeleteAdmin(deletedUser.id);
        }
    }
    const updatedAdmin = yield AdminUserRepository.updateAdmin(id, payload);
    const adminData = updatedAdmin === null || updatedAdmin === void 0 ? void 0 : updatedAdmin.toJSON();
    if (adminData) {
        delete adminData.password;
    }
    return adminData;
});
exports.updateAdminUser = updateAdminUser;
/**
 * @name deleteAdminUser
 * @description
 * Delete admin user by id.
 * This is a soft delete, so the record will be marked as deleted but not removed from the database.
 * @access Private | Role-based
 */
const deleteAdminUser = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const admin = yield AdminUserRepository.findAdminById(id);
    if (!admin) {
        throw new apiError_util_1.ApiError(enums_1.STATUS_CODE.NOT_FOUND, messages_1.MESSAGES.USER.ADMIN_NOT_FOUND);
    }
    yield AdminUserRepository.deleteAdmin(id);
});
exports.deleteAdminUser = deleteAdminUser;
