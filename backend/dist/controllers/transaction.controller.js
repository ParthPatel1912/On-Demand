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
exports.getTransactionById = exports.deleteTransaction = exports.getTransactions = void 0;
const TransactionService = __importStar(require("../services/transaction.service"));
const logger_1 = __importDefault(require("../utils/logger"));
const response_util_1 = require("../utils/response.util");
const messages_1 = require("../constants/messages");
/**
 * Get all transactions
 */
const getTransactions = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        logger_1.default.info("TransactionController: Get all transactions request");
        const { minAmount, maxAmount, paymentMethod, sortBy, sortOrder, page, limit, } = req.query;
        const filter = {
            minAmount: minAmount !== undefined ? parseFloat(minAmount) : undefined,
            maxAmount: maxAmount !== undefined ? parseFloat(maxAmount) : undefined,
            paymentMethod: paymentMethod,
            sortBy: sortBy,
            sortOrder: sortOrder,
            page: page ? parseInt(page, 10) : 1,
            limit: limit ? parseInt(limit, 10) : 10,
        };
        const data = yield TransactionService.getAllTransactions(filter);
        return (0, response_util_1.sendResponse)(res, {
            data: data.transactions,
            pagination: data.pagination,
        });
    }
    catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        logger_1.default.error(`TransactionController: Error fetching transactions: ${message}`);
        next(error);
    }
});
exports.getTransactions = getTransactions;
/**
 * Delete a transaction
 */
const deleteTransaction = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        logger_1.default.info(`TransactionController: Delete transaction request for ID: ${id}`);
        yield TransactionService.deleteTransaction(id);
        return (0, response_util_1.sendResponse)(res, messages_1.MESSAGES.TRANSACTION.DELETED);
    }
    catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        logger_1.default.error(`TransactionController: Error deleting transaction: ${message}`);
        next(error);
    }
});
exports.deleteTransaction = deleteTransaction;
/**
 * Get transaction by ID
 */
const getTransactionById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        logger_1.default.info(`TransactionController: Get transaction by ID request for ID: ${id}`);
        const data = yield TransactionService.getTransactionById(id);
        return (0, response_util_1.sendResponse)(res, undefined, data);
    }
    catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        logger_1.default.error(`TransactionController: Error fetching transaction by ID: ${message}`);
        next(error);
    }
});
exports.getTransactionById = getTransactionById;
