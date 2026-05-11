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
Object.defineProperty(exports, "__esModule", { value: true });
exports.deletePayment = exports.findPaymentById = exports.findPaymentsByUserId = exports.findPaymentWithDetailsById = exports.findLatestUserTransactions = void 0;
const models_1 = require("../models");
const sequelize_1 = require("sequelize");
/**
 * @name findLatestUserTransactions
 * @description
 * This function performs a two-step query to get the latest transaction for each user.
 * 1. It optionally filters for user IDs that have at least one transaction matching the provided criteria.
 * 2. It then fetches the single latest transaction for each of those users using a Postgres-specific DISTINCT ON.
 * @param whereClause Criteria to filter transactions (e.g., amount, payment method).
 * @param limit Number of records to return.
 * @param offset Number of records to skip.
 * @param order Sorting criteria.
 * @access Public
 */
const findLatestUserTransactions = (whereClause, limit, offset, order) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    let userIdsFilter = {};
    // Step 1: Find user IDs that have ANY transaction matching the filters
    if (Object.keys(whereClause).length > 0) {
        const matchingUsers = yield models_1.Payment.findAll({
            attributes: ["userId"],
            where: whereClause,
            group: ["userId"],
        });
        const userIds = matchingUsers.map((m) => m.userId);
        // If filters were applied but no transactions match, return empty early
        if (userIds.length === 0) {
            return { count: 0, rows: [] };
        }
        userIdsFilter = { userId: { [sequelize_1.Op.in]: userIds } };
    }
    // Step 2: For those users (or all users if no filter), find their LATEST transaction ID
    const finalWhereClause = Object.assign(Object.assign({}, userIdsFilter), { id: {
            [sequelize_1.Op.in]: (_a = models_1.Payment.sequelize) === null || _a === void 0 ? void 0 : _a.literal(`(
        SELECT DISTINCT ON (user_id) id
        FROM payments
        ORDER BY user_id, created_at DESC
      )`),
        } });
    return yield models_1.Payment.findAndCountAll({
        where: finalWhereClause,
        include: [
            { model: models_1.User, as: "user", attributes: ["id", "name", "mobileNumber"] },
            { model: models_1.Service, as: "service", attributes: ["name"] },
            {
                model: models_1.Booking,
                as: "booking",
                attributes: ["id", "createdAt", "status"],
            },
        ],
        order,
        limit,
        offset,
    });
});
exports.findLatestUserTransactions = findLatestUserTransactions;
/**
 * @name findPaymentWithDetailsById
 * @description
 * Fetches a single payment record by its primary key, including related user, service, and booking data.
 * @param id The payment ID.
 * @access Public
 */
const findPaymentWithDetailsById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    return yield models_1.Payment.findByPk(id, {
        include: [
            { model: models_1.User, as: "user", attributes: ["id", "name", "mobileNumber"] },
            { model: models_1.Service, as: "service", attributes: ["id", "name"] },
            {
                model: models_1.Booking,
                as: "booking",
                attributes: ["id", "createdAt", "status"],
            },
        ],
    });
});
exports.findPaymentWithDetailsById = findPaymentWithDetailsById;
/**
 * @name findPaymentsByUserId
 * @description
 * Retrieves all payment records associated with a specific user, ordered by creation date.
 * @param userId The user's unique identifier.
 * @access Public
 */
const findPaymentsByUserId = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    return yield models_1.Payment.findAll({
        where: { userId },
        include: [{ model: models_1.Service, as: "service", attributes: ["name"] }],
        order: [["createdAt", "DESC"]],
    });
});
exports.findPaymentsByUserId = findPaymentsByUserId;
/**
 * @name findPaymentById
 * @description
 * A simple lookup to find a payment by its primary key.
 * @param id The payment ID.
 * @access Public
 */
const findPaymentById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    return yield models_1.Payment.findByPk(id);
});
exports.findPaymentById = findPaymentById;
/**
 * @name deletePayment
 * @description
 * Standard deletion wrapper for the Payment model.
 * @param payment The payment model instance to destroy.
 * @access Public
 */
const deletePayment = (payment) => __awaiter(void 0, void 0, void 0, function* () {
    return yield payment.destroy();
});
exports.deletePayment = deletePayment;
