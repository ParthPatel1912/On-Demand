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
exports.updateBookingAndPaymentWithTransaction = exports.updateBooking = exports.updatePayment = exports.findUserById = exports.findServiceById = exports.findBookingById = exports.findPaymentById = void 0;
const models_1 = require("../models");
const db_1 = __importDefault(require("../configs/db"));
/**
 * Finds a payment by its primary key.
 */
const findPaymentById = (id, options) => __awaiter(void 0, void 0, void 0, function* () {
    return yield models_1.Payment.findByPk(id, options);
});
exports.findPaymentById = findPaymentById;
/**
 * Finds a booking by its primary key.
 */
const findBookingById = (id, options) => __awaiter(void 0, void 0, void 0, function* () {
    return yield models_1.Booking.findByPk(id, options);
});
exports.findBookingById = findBookingById;
/**
 * Finds a service by its primary key.
 */
const findServiceById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    return yield models_1.Service.findByPk(id);
});
exports.findServiceById = findServiceById;
/**
 * Finds a user by its primary key.
 */
const findUserById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    return yield models_1.User.findByPk(id);
});
exports.findUserById = findUserById;
/**
 * Updates a payment record.
 */
const updatePayment = (payment, data, transaction) => __awaiter(void 0, void 0, void 0, function* () {
    return yield payment.update(data, { transaction });
});
exports.updatePayment = updatePayment;
/**
 * Updates a booking record.
 */
const updateBooking = (booking, data, transaction) => __awaiter(void 0, void 0, void 0, function* () {
    return yield booking.update(data, { transaction });
});
exports.updateBooking = updateBooking;
/**
 * Performs a transactional update of both booking and payment records.
 */
const updateBookingAndPaymentWithTransaction = (booking, payment, bookingData, paymentData) => __awaiter(void 0, void 0, void 0, function* () {
    return yield db_1.default.transaction((transaction) => __awaiter(void 0, void 0, void 0, function* () {
        yield booking.update(bookingData, { transaction });
        yield payment.update(paymentData, { transaction });
    }));
});
exports.updateBookingAndPaymentWithTransaction = updateBookingAndPaymentWithTransaction;
