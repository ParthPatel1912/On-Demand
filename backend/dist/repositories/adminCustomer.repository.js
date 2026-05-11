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
exports.findAllCustomerBookingServices = exports.findPendingBookingCountsByUserIds = exports.findTotalBookingCountsByUserIds = exports.findUserIdsExceedingMaxBookings = exports.findUserIdsWithMinBookings = exports.createCustomer = exports.findAllCustomers = exports.findCustomerByIdAndRoleId = exports.findCustomerByEmailOrMobile = exports.findCustomerById = exports.resolveRoleId = void 0;
const sequelize_1 = require("sequelize");
const db_1 = __importDefault(require("../configs/db"));
const models_1 = require("../models");
const transaction_enum_1 = require("../enums/transaction.enum");
const role_repository_1 = require("../repositories/role.repository");
// ─────────────────────────────────────────────────────────────────────────────
// Role helpers
// ─────────────────────────────────────────────────────────────────────────────
/**
 * Resolves a role name to its DB id. Throws if the role is not found.
 */
const resolveRoleId = (roleName) => __awaiter(void 0, void 0, void 0, function* () {
    const id = yield (0, role_repository_1.getRoleIdByName)(roleName);
    if (!id)
        throw new Error(`Role "${roleName}" not found in roles table`);
    return id;
});
exports.resolveRoleId = resolveRoleId;
// ─────────────────────────────────────────────────────────────────────────────
// Customer (User) queries
// ─────────────────────────────────────────────────────────────────────────────
const findCustomerById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    return yield models_1.User.findByPk(id);
});
exports.findCustomerById = findCustomerById;
/**
 * Find a customer by email OR mobile number (for duplicate checks).
 * Includes soft-deleted records (paranoid: false).
 */
const findCustomerByEmailOrMobile = (email, mobileNumber) => __awaiter(void 0, void 0, void 0, function* () {
    return yield models_1.User.findOne({
        where: {
            [sequelize_1.Op.or]: [{ email }, { mobileNumber }],
        },
        paranoid: false,
    });
});
exports.findCustomerByEmailOrMobile = findCustomerByEmailOrMobile;
/**
 * Find a single customer by id and roleId (used for status update / delete).
 */
const findCustomerByIdAndRoleId = (id, roleId) => __awaiter(void 0, void 0, void 0, function* () {
    return yield models_1.User.findOne({ where: { id, roleId } });
});
exports.findCustomerByIdAndRoleId = findCustomerByIdAndRoleId;
/**
 * Paginated list of customers with search, status, and sort support.
 * Uses roleId (FK) instead of the removed `role` column.
 */
const findAllCustomers = (options) => __awaiter(void 0, void 0, void 0, function* () {
    return yield models_1.User.findAndCountAll({
        where: options.where,
        limit: options.limit,
        offset: options.offset,
        order: options.order,
        subQuery: false,
        attributes: {
            exclude: ["password", "rememberToken"],
        },
    });
});
exports.findAllCustomers = findAllCustomers;
/**
 * Create a new customer user record.
 */
const createCustomer = (data) => __awaiter(void 0, void 0, void 0, function* () {
    return yield models_1.User.create(data);
});
exports.createCustomer = createCustomer;
// ─────────────────────────────────────────────────────────────────────────────
// Booking count helpers (used for minBookings / maxBookings filtering)
// ─────────────────────────────────────────────────────────────────────────────
/**
 * Return all userId values that have at least `min` bookings.
 */
const findUserIdsWithMinBookings = (min) => __awaiter(void 0, void 0, void 0, function* () {
    const rows = yield models_1.Booking.findAll({
        attributes: ["userId"],
        group: ["userId"],
        having: db_1.default.where(db_1.default.fn("COUNT", db_1.default.col("id")), ">=", min),
    });
    return rows.map((b) => b.userId);
});
exports.findUserIdsWithMinBookings = findUserIdsWithMinBookings;
/**
 * Return all userId values that have MORE than `max` bookings (to exclude them).
 */
const findUserIdsExceedingMaxBookings = (max) => __awaiter(void 0, void 0, void 0, function* () {
    const rows = yield models_1.Booking.findAll({
        attributes: ["userId"],
        group: ["userId"],
        having: db_1.default.where(db_1.default.fn("COUNT", db_1.default.col("id")), ">", max),
    });
    return rows.map((b) => b.userId);
});
exports.findUserIdsExceedingMaxBookings = findUserIdsExceedingMaxBookings;
/**
 * Returns a map of { userId → totalBookingCount } for the given user IDs.
 */
const findTotalBookingCountsByUserIds = (userIds) => __awaiter(void 0, void 0, void 0, function* () {
    const rows = yield models_1.Booking.findAll({
        attributes: ["userId", [db_1.default.fn("COUNT", db_1.default.col("id")), "count"]],
        where: { userId: { [sequelize_1.Op.in]: userIds } },
        group: ["userId"],
    });
    return Object.fromEntries(rows.map((b) => [b.userId, Number(b.getDataValue("count"))]));
});
exports.findTotalBookingCountsByUserIds = findTotalBookingCountsByUserIds;
/**
 * Returns a map of { userId → pendingBookingCount } for the given user IDs.
 */
const findPendingBookingCountsByUserIds = (userIds) => __awaiter(void 0, void 0, void 0, function* () {
    const rows = yield models_1.Booking.findAll({
        attributes: ["userId", [db_1.default.fn("COUNT", db_1.default.col("id")), "count"]],
        where: { userId: { [sequelize_1.Op.in]: userIds }, status: transaction_enum_1.BookingStatus.PENDING },
        group: ["userId"],
    });
    return Object.fromEntries(rows.map((b) => [b.userId, Number(b.getDataValue("count"))]));
});
exports.findPendingBookingCountsByUserIds = findPendingBookingCountsByUserIds;
// ─────────────────────────────────────────────────────────────────────────────
// Booking (customer-bookings tab) queries
// ─────────────────────────────────────────────────────────────────────────────
const findAllCustomerBookingServices = (limit, offset, whereCondition, orderArray, serviceType, paymentMethod) => __awaiter(void 0, void 0, void 0, function* () {
    const options = {
        where: whereCondition,
        include: [
            {
                model: models_1.ServiceType,
                as: "serviceType",
                attributes: ["id", "name"],
                required: !!serviceType,
                where: serviceType
                    ? isNaN(Number(serviceType))
                        ? { name: { [sequelize_1.Op.iLike]: `%${serviceType}%` } }
                        : { id: Number(serviceType) }
                    : undefined,
            },
            {
                model: models_1.Service,
                as: "service",
                attributes: ["id", "name"],
            },
            {
                model: models_1.Payment,
                as: "payment",
                attributes: ["paymentMethod", "paymentStatus"],
                required: !!paymentMethod,
                where: paymentMethod ? { paymentMethod } : undefined,
            },
            {
                model: models_1.ServicePartner,
                as: "servicePartner",
                attributes: ["id", "verificationStatus"],
                include: [
                    {
                        model: models_1.User,
                        as: "user",
                        attributes: ["name", "profileImage", "mobileNumber"],
                    },
                    {
                        model: models_1.ServiceType,
                        as: "serviceType",
                        attributes: ["id", "name"],
                    },
                ],
            },
        ],
        order: orderArray,
        limit,
        offset,
        distinct: true,
    };
    const { rows, count } = yield models_1.Booking.findAndCountAll(options);
    return {
        rows: rows,
        count,
    };
});
exports.findAllCustomerBookingServices = findAllCustomerBookingServices;
