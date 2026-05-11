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
exports.deleteTransaction = exports.getTransactionById = exports.getAllTransactions = void 0;
const apiError_util_1 = require("../utils/apiError.util");
const logger_1 = __importDefault(require("../utils/logger"));
const models_1 = require("../models");
const sequelize_1 = require("sequelize");
const transaction_enum_1 = require("../enums/transaction.enum");
const messages_1 = require("../constants/messages");
const enums_1 = require("../enums");
const log_enum_1 = require("../enums/log.enum");
const BookingRepository = __importStar(require("../repositories/booking.repository"));
const TransactionRepository = __importStar(require("../repositories/transaction.repository"));
const mapPaymentMethod = (dbValue) => {
    if (dbValue === transaction_enum_1.PaymentMethod.CARD)
        return "Credit Card";
    if (dbValue === transaction_enum_1.PaymentMethod.CASH)
        return "Cash";
    return dbValue;
};
const mapToFrontendMethod = (frontendValue) => {
    if (frontendValue === "Credit Card")
        return transaction_enum_1.PaymentMethod.CARD;
    if (frontendValue === "Cash")
        return transaction_enum_1.PaymentMethod.CASH;
    return undefined;
};
/**
 * Get all transactions with filtering, sorting, and pagination
 * @param filter Transaction filter options
 */
const getAllTransactions = (filter) => __awaiter(void 0, void 0, void 0, function* () {
    logger_1.default.info(`TransactionService: Fetching transactions with filter: ${JSON.stringify(filter)}`);
    const whereClause = {};
    if (filter.minAmount !== undefined || filter.maxAmount !== undefined) {
        const totalAmountFilter = {};
        if (filter.minAmount !== undefined)
            totalAmountFilter[sequelize_1.Op.gte] = filter.minAmount;
        if (filter.maxAmount !== undefined)
            totalAmountFilter[sequelize_1.Op.lte] = filter.maxAmount;
        whereClause.totalAmount =
            totalAmountFilter;
    }
    if (filter.paymentMethod && filter.paymentMethod !== "all") {
        const dbMethod = mapToFrontendMethod(filter.paymentMethod);
        if (dbMethod) {
            whereClause.paymentMethod = dbMethod;
        }
    }
    // Sorting
    let orderResult = [];
    const sortBy = filter.sortBy || "createdAt";
    const sortOrder = (filter.sortOrder || "DESC");
    // Map "userName" to User.name for sorting
    if (sortBy === "userName") {
        orderResult = [[{ model: models_1.User, as: "user" }, "name", sortOrder]];
    }
    else if (sortBy === "serviceName") {
        orderResult = [[{ model: models_1.Service, as: "service" }, "name", sortOrder]];
    }
    else if (sortBy === "amount" || sortBy === "totalAmount") {
        orderResult = [["totalAmount", sortOrder]];
    }
    else {
        orderResult = [[sortBy, sortOrder]];
    }
    // Pagination
    const page = filter.page || 1;
    const limit = filter.limit || 10;
    const offset = (page - 1) * limit;
    const { count, rows } = yield TransactionRepository.findLatestUserTransactions(whereClause, limit, offset, orderResult);
    const transactions = rows.map((p) => {
        var _a, _b, _c, _d, _e, _f, _g;
        const transactionId = ((_a = p.paymentIntentId) === null || _a === void 0 ? void 0 : _a.trim()) ||
            ((_b = p.sessionId) === null || _b === void 0 ? void 0 : _b.trim()) ||
            ((_c = p.orderId) === null || _c === void 0 ? void 0 : _c.trim()) ||
            `TXN-${p.id}`;
        return {
            id: p.id.toString(),
            userId: ((_d = p.user) === null || _d === void 0 ? void 0 : _d.id.toString()) || "",
            userName: ((_e = p.user) === null || _e === void 0 ? void 0 : _e.name) || "Unknown",
            transactionId,
            mobileNumber: ((_f = p.user) === null || _f === void 0 ? void 0 : _f.mobileNumber) || "N/A",
            serviceName: ((_g = p.service) === null || _g === void 0 ? void 0 : _g.name) || "Unknown Service",
            amount: parseFloat(p.totalAmount),
            currency: p.currency || log_enum_1.CurrencySymbol.USD,
            paymentMethod: mapPaymentMethod(p.paymentMethod),
            status: p.paymentStatus === transaction_enum_1.PaymentStatus.PAID ? "Success" : "Pending",
            createdAt: p.createdAt,
        };
    });
    function getCountValue(count) {
        if (typeof count === "number")
            return count;
        if (typeof count === "object" && count !== null && "length" in count)
            return count.length;
        return 0;
    }
    return {
        transactions,
        pagination: {
            totalItems: getCountValue(count),
            currentPage: page,
            totalPages: Math.ceil(getCountValue(count) / limit),
            limit,
        },
    };
});
exports.getAllTransactions = getAllTransactions;
/**
 * Get a transaction by ID
 * @param id Transaction ID
 */
const getTransactionById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f, _g;
    logger_1.default.info(`TransactionService: Fetching transaction with ID: ${id}`);
    const paymentData = yield TransactionRepository.findPaymentWithDetailsById(id);
    if (!paymentData) {
        throw new apiError_util_1.ApiError(enums_1.STATUS_CODE.NOT_FOUND, messages_1.MESSAGES.TRANSACTION.NOT_FOUND);
    }
    const payment = paymentData;
    // Find other transactions by the same user
    const userPayments = yield TransactionRepository.findPaymentsByUserId(payment.userId);
    // Reorder so current payment is first, then others by date
    const sortedPayments = userPayments.sort((a, b) => {
        if (a.id === payment.id)
            return -1;
        if (b.id === payment.id)
            return 1;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
    const otherTransactions = sortedPayments.map((p) => {
        var _a;
        return ({
            id: p.id.toString(),
            transactionId: p.paymentIntentId || p.sessionId || p.orderId || `TXN-${p.id}`,
            service: ((_a = p.service) === null || _a === void 0 ? void 0 : _a.name) || "Unknown Service",
            amount: parseFloat(p.totalAmount),
            currency: p.currency || "USD",
            paymentMethod: mapPaymentMethod(p.paymentMethod),
        });
    });
    return {
        id: payment.id.toString(),
        userId: ((_a = payment.user) === null || _a === void 0 ? void 0 : _a.id.toString()) || "",
        bookingId: ((_c = (_b = payment.booking) === null || _b === void 0 ? void 0 : _b.id) === null || _c === void 0 ? void 0 : _c.toString()) || "",
        invoiceNumber: BookingRepository.generateInvoiceNumber(Number(((_d = payment.booking) === null || _d === void 0 ? void 0 : _d.id) || 0)),
        userName: ((_e = payment.user) === null || _e === void 0 ? void 0 : _e.name) || "Unknown",
        transactionId: payment.paymentIntentId ||
            payment.sessionId || payment.orderId ||
            `TXN-${payment.id}`,
        mobileNumber: ((_f = payment.user) === null || _f === void 0 ? void 0 : _f.mobileNumber) || "N/A",
        serviceId: payment.serviceId.toString(),
        serviceName: ((_g = payment.service) === null || _g === void 0 ? void 0 : _g.name) || "Unknown Service",
        amount: parseFloat(payment.totalAmount),
        currency: payment.currency || "USD",
        paymentType: "Service Payment",
        paymentMethod: mapPaymentMethod(payment.paymentMethod),
        dateTime: new Date(payment.createdAt).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        }) +
            " " +
            new Date(payment.createdAt).toLocaleTimeString("en-US", {
                hour: "numeric",
                minute: "2-digit",
                hour12: true,
            }), // "27 Aug 2025 1:58 PM"
        otherTransactions,
    };
});
exports.getTransactionById = getTransactionById;
/**
 * Delete a transaction by ID
 * @param id Transaction ID
 */
const deleteTransaction = (id) => __awaiter(void 0, void 0, void 0, function* () {
    logger_1.default.info(`TransactionService: Deleting transaction ID: ${id}`);
    const payment = yield TransactionRepository.findPaymentById(id);
    if (!payment) {
        logger_1.default.warn(`Transaction not found ID: ${id}`);
        throw new apiError_util_1.ApiError(enums_1.STATUS_CODE.NOT_FOUND, messages_1.MESSAGES.TRANSACTION.NOT_FOUND);
    }
    yield TransactionRepository.deletePayment(payment);
    return true;
});
exports.deleteTransaction = deleteTransaction;
