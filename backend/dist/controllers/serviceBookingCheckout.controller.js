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
exports.retryBookingPayment = exports.getBookingWithPayment = exports.processPayment = void 0;
const service = __importStar(require("../services/serviceBookingCheckout.service"));
const asyncErrorHandler_1 = __importDefault(require("../utils/asyncErrorHandler"));
const response_util_1 = require("../utils/response.util");
const messages_1 = require("../constants/messages");
/**
 * POST /service/checkout/pay
 * Process service booking payment (cash or card)
 */
exports.processPayment = (0, asyncErrorHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const body = req.body || {};
    const tax = Number(body.tax || 0);
    const result = yield service.processBookingPayment({
        userId: (_b = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id) !== null && _b !== void 0 ? _b : body.userId,
        serviceId: body.serviceId,
        addressId: body.addressId,
        slot: body.slot,
        paymentMethod: body.paymentMethod,
        paymentGateway: body.paymentGateway || null,
        couponId: body.couponId,
        tax,
    });
    return (0, response_util_1.sendResponse)(res, messages_1.MESSAGES.PAYMENT.PROCESSED, result);
}));
/**
 * GET /service/checkout/:bookingId
 * Retrieve a specific booking and its associated payment information.
 */
exports.getBookingWithPayment = (0, asyncErrorHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const bookingId = Number(req.params.bookingId);
    const booking = yield service.getBookingWithPaymentService(bookingId);
    return (0, response_util_1.sendResponse)(res, messages_1.MESSAGES.BOOKING.FETCHED_WITH_PAYMENT_DETAILS, booking);
}));
/**
 * PUT /service/checkout/:bookingId
 * Retry a failed service booking payment.
 */
exports.retryBookingPayment = (0, asyncErrorHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { bookingId, paymentMethod, paymentGateway } = req.body || {};
    const booking = yield service.retryBookingPaymentService({
        bookingId,
        paymentMethod,
        paymentGateway,
    });
    return (0, response_util_1.sendResponse)(res, messages_1.MESSAGES.PAYMENT.RETRIED, booking);
}));
