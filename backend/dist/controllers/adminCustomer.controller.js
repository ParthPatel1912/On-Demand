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
const AdminCustomerService = __importStar(require("../services/adminCustomer.service"));
const logger_1 = __importDefault(require("../utils/logger"));
const response_util_1 = require("../utils/response.util");
const messages_1 = require("../constants/messages");
const enums_1 = require("../enums");
const common_utils_1 = require("../utils/common.utils");
/**
 * GET /api/admin-customers
 */
const listCustomers = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { page, limit, search, status, minBookings, maxBookings } = req.query;
        const sortBy = (req.query.sortBy || req.query.sort_by);
        const sortOrder = (req.query.sortOrder || req.query.sort_order);
        const data = yield AdminCustomerService.listCustomers({
            page: page,
            limit: limit,
            sortBy: sortBy,
            sortOrder: sortOrder || "DESC",
            search: search,
            status: status,
            minBookings,
            maxBookings
        });
        return (0, response_util_1.sendResponse)(res, Object.assign({}, data));
    }
    catch (error) {
        logger_1.default.error(`AdminCustomerController.listCustomers Error: ${(0, common_utils_1.getErrorMessage)(error)}`);
        next(error);
    }
});
exports.listCustomers = listCustomers;
/**
 * POST /api/admin-customers
 */
const createCustomer = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        logger_1.default.info("AdminCustomerController: Create customer request");
        const data = yield AdminCustomerService.createCustomer(req.body);
        return (0, response_util_1.sendResponse)(res, messages_1.MESSAGES.CUSTOMER.CREATED, data, enums_1.STATUS_CODE.CREATED);
    }
    catch (error) {
        logger_1.default.error(`AdminCustomerController.createCustomer Error: ${(0, common_utils_1.getErrorMessage)(error)}`);
        next(error);
    }
});
exports.createCustomer = createCustomer;
/**
 * PATCH /api/admin-customers/:id/status
 */
const updateCustomerStatus = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = req.params.id;
        const { isActive } = req.body;
        logger_1.default.info(`AdminCustomerController: Update customer status request for id ${id}`);
        const data = yield AdminCustomerService.updateCustomerStatus(id, isActive);
        return (0, response_util_1.sendResponse)(res, messages_1.MESSAGES.CUSTOMER.STATUS_UPDATED(isActive), data);
    }
    catch (error) {
        logger_1.default.error(`AdminCustomerController.updateCustomerStatus Error: ${(0, common_utils_1.getErrorMessage)(error)}`);
        next(error);
    }
});
exports.updateCustomerStatus = updateCustomerStatus;
/**
 * DELETE /api/admin-customers/delete-customer/:id
 */
const deleteCustomer = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = req.params.id;
        logger_1.default.info(`AdminCustomerController: Delete customer request for id ${id}`);
        yield AdminCustomerService.deleteCustomer(id);
        return (0, response_util_1.sendResponse)(res, messages_1.MESSAGES.CUSTOMER.DELETED);
    }
    catch (error) {
        logger_1.default.error(`AdminCustomerController.deleteCustomer Error: ${(0, common_utils_1.getErrorMessage)(error)}`);
        next(error);
    }
});
exports.deleteCustomer = deleteCustomer;
