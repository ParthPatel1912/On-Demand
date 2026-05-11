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
exports.getCustomerBookingServices = exports.getCustomerDetailById = void 0;
const AdminCustomerService = __importStar(require("../services/adminCustomerBookings.service"));
const logger_1 = __importDefault(require("../utils/logger"));
const response_util_1 = require("../utils/response.util");
const messages_1 = require("../constants/messages");
const common_utils_1 = require("../utils/common.utils");
/**
 * @name getCustomerDetailById
 * @description Get Customer Details By ID.
 * @access Private
 */
const getCustomerDetailById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        logger_1.default.info(`AdminCustomerBookingsController: Get Customer detail request for id ${id}`);
        const result = yield AdminCustomerService.getCustomerDetailById(Number(id));
        return (0, response_util_1.sendResponse)(res, messages_1.MESSAGES.CUSTOMER.FETCHED, result);
    }
    catch (error) {
        logger_1.default.error(`AdminCustomerBookingsController:getCustomerDetailById Error ${(0, common_utils_1.getErrorMessage)(error)}`);
        next(error);
    }
});
exports.getCustomerDetailById = getCustomerDetailById;
/**
 * @name getCustomerBookingServices
 * @description List Custmore users with pagination, filtering and sorting.
 * @access Private
 */
const getCustomerBookingServices = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const query = req.query;
    try {
        const result = yield AdminCustomerService.getCustomerBookingServices(Number(id), query);
        return (0, response_util_1.sendResponse)(res, messages_1.MESSAGES.BOOKING.CUSTOMER_BOOKING_SERVICES_FETCHED, result);
    }
    catch (error) {
        logger_1.default.error(`AdminCustomerBookingsController:getCustomerBookingServices error: ${(0, common_utils_1.getErrorMessage)(error)}`);
        next(error);
    }
});
exports.getCustomerBookingServices = getCustomerBookingServices;
