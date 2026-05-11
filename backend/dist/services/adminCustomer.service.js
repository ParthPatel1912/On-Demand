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
exports.deleteCustomer = exports.updateCustomerStatus = exports.createCustomer = exports.listCustomers = void 0;
const sequelize_1 = require("sequelize");
const db_1 = __importDefault(require("../configs/db"));
const apiError_util_1 = require("../utils/apiError.util");
const logger_1 = __importDefault(require("../utils/logger"));
const userRole_enum_1 = require("../enums/userRole.enum");
const transaction_enum_1 = require("../enums/transaction.enum");
const messages_1 = require("../constants/messages");
const enums_1 = require("../enums");
const AdminCustomerRepository = __importStar(require("../repositories/adminCustomer.repository"));
const listCustomers = (query) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const page = Math.max(1, Number(query.page || 1));
    const limit = Math.max(1, Math.min(100, Number(query.limit || 10)));
    const offset = (page - 1) * limit;
    // Resolve "CUSTOMER" role name → role_id (cached after first call)
    const customerRoleId = yield AdminCustomerRepository.resolveRoleId(userRole_enum_1.UserRole.CUSTOMER);
    const where = { roleId: customerRoleId };
    // Search by name, email, or mobile number
    if ((_a = query.search) === null || _a === void 0 ? void 0 : _a.trim()) {
        const search = `%${query.search.trim()}%`;
        where[sequelize_1.Op.or] = [
            { name: { [sequelize_1.Op.iLike]: search } },
            { email: { [sequelize_1.Op.iLike]: search } },
            { mobileNumber: { [sequelize_1.Op.iLike]: search } },
        ];
    }
    if (query.status !== undefined) {
        where.isActive = query.status === "active";
    }
    // Booking count filtering
    if (query.minBookings !== undefined && query.minBookings !== "") {
        const min = Number(query.minBookings);
        if (min > 0) {
            const qualifyingUserIds = yield AdminCustomerRepository.findUserIdsWithMinBookings(min);
            if (qualifyingUserIds.length === 0) {
                return { data: [], pagination: { currentPage: page, limit, totalItems: 0, totalPages: 0 } };
            }
            where.id = { [sequelize_1.Op.in]: qualifyingUserIds };
        }
    }
    if (query.maxBookings !== undefined && query.maxBookings !== "") {
        const max = Number(query.maxBookings);
        const violatingUserIds = yield AdminCustomerRepository.findUserIdsExceedingMaxBookings(max);
        if (violatingUserIds.length > 0) {
            if (where.id && where.id[sequelize_1.Op.in]) {
                where.id[sequelize_1.Op.in] = where.id[sequelize_1.Op.in].filter((id) => !violatingUserIds.includes(id));
                if (where.id[sequelize_1.Op.in].length === 0) {
                    return { data: [], pagination: { currentPage: page, limit, totalItems: 0, totalPages: 0 } };
                }
            }
            else {
                where.id = { [sequelize_1.Op.notIn]: violatingUserIds };
            }
        }
    }
    // Sorting
    const allowedSortFields = ["id", "name", "email", "createdAt", "isActive", "mobileNumber", "totalBookings", "pendingBookings"];
    const sortOrder = query.sortOrder === "ASC" ? "ASC" : "DESC";
    let order;
    if (query.sortBy === "totalBookings") {
        order = [[db_1.default.literal(`(SELECT COUNT(*) FROM bookings WHERE bookings.user_id = "User"."id")`), sortOrder]];
    }
    else if (query.sortBy === "pendingBookings") {
        order = [[db_1.default.literal(`(SELECT COUNT(*) FROM bookings WHERE bookings.user_id = "User"."id" AND bookings.status = '${transaction_enum_1.BookingStatus.PENDING}'::"enum_bookings_status")`), sortOrder]];
    }
    else {
        const sortBy = allowedSortFields.includes(query.sortBy || "")
            ? query.sortBy === "status" ? "isActive" : query.sortBy
            : "createdAt";
        order = [[sortBy, sortOrder]];
    }
    logger_1.default.info(`AdminCustomerService: Fetching customers with page: ${page}, limit: ${limit}, filtering: ${JSON.stringify(where)}, sorting: ${query.sortBy || "createdAt"} ${sortOrder}`);
    const { rows, count: totalItems } = yield AdminCustomerRepository.findAllCustomers({
        where,
        limit,
        offset,
        order,
    });
    // Fetch booking counts for the retrieved users
    const userIds = rows.map((u) => u.id);
    let totalMap = {};
    let pendingMap = {};
    if (userIds.length > 0) {
        [totalMap, pendingMap] = yield Promise.all([
            AdminCustomerRepository.findTotalBookingCountsByUserIds(userIds),
            AdminCustomerRepository.findPendingBookingCountsByUserIds(userIds),
        ]);
    }
    const data = rows.map((user) => {
        const userJson = user.toJSON();
        return Object.assign(Object.assign({}, userJson), { totalBookings: totalMap[user.id] || 0, pendingBookings: pendingMap[user.id] || 0 });
    });
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
exports.listCustomers = listCustomers;
const createCustomer = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, email, mobileNumber } = payload;
    const existing = yield AdminCustomerRepository.findCustomerByEmailOrMobile(email, mobileNumber);
    if (existing) {
        const isDeleted = existing.deletedAt !== null;
        if (existing.email === email) {
            throw new apiError_util_1.ApiError(enums_1.STATUS_CODE.CONFLICT, isDeleted
                ? messages_1.MESSAGES.CUSTOMER.ALREADY_EMAIL_EXISTS_DEACTIVATED
                : messages_1.MESSAGES.CUSTOMER.EMAIL_EXISTS);
        }
        if (existing.mobileNumber === mobileNumber) {
            throw new apiError_util_1.ApiError(enums_1.STATUS_CODE.CONFLICT, isDeleted
                ? messages_1.MESSAGES.CUSTOMER.ALREADY_MOBILE_EXISTS_DEACTIVATED
                : messages_1.MESSAGES.CUSTOMER.MOBILE_EXISTS);
        }
    }
    // Resolve role id once
    const customerRoleId = yield AdminCustomerRepository.resolveRoleId(userRole_enum_1.UserRole.CUSTOMER);
    const customer = yield AdminCustomerRepository.createCustomer({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        mobileNumber: mobileNumber.trim(),
        roleId: customerRoleId,
        isActive: true,
    });
    logger_1.default.info(`AdminCustomerService: New customer created with id: ${customer.id}`);
    const data = customer.toJSON();
    delete data.password;
    delete data.rememberToken;
    return data;
});
exports.createCustomer = createCustomer;
const updateCustomerStatus = (id, isActive) => __awaiter(void 0, void 0, void 0, function* () {
    const customerRoleId = yield AdminCustomerRepository.resolveRoleId(userRole_enum_1.UserRole.CUSTOMER);
    const customer = yield AdminCustomerRepository.findCustomerByIdAndRoleId(id, customerRoleId);
    if (!customer) {
        throw new apiError_util_1.ApiError(enums_1.STATUS_CODE.NOT_FOUND, messages_1.MESSAGES.CUSTOMER.NOT_FOUND);
    }
    yield customer.update({ isActive });
    logger_1.default.info(`AdminCustomerService: Customer ${id} status updated to ${isActive ? "Active" : "Blocked"}`);
    const data = customer.toJSON();
    delete data.password;
    delete data.rememberToken;
    return data;
});
exports.updateCustomerStatus = updateCustomerStatus;
const deleteCustomer = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const customerRoleId = yield AdminCustomerRepository.resolveRoleId(userRole_enum_1.UserRole.CUSTOMER);
    const customer = yield AdminCustomerRepository.findCustomerByIdAndRoleId(id, customerRoleId);
    if (!customer) {
        throw new apiError_util_1.ApiError(enums_1.STATUS_CODE.NOT_FOUND, messages_1.MESSAGES.CUSTOMER.NOT_FOUND);
    }
    yield customer.destroy(); // Soft delete (paranoid: true)
    logger_1.default.info(`AdminCustomerService: Customer ${id} soft deleted successfully`);
});
exports.deleteCustomer = deleteCustomer;
