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
exports.findServiceById = exports.findBookingById = exports.findPaymentById = exports.updatePaymentAndBookingWithTransaction = exports.getServiceAndUserContext = exports.findBookingByPaymentId = exports.findPaymentByOrderId = void 0;
const booking_model_1 = __importDefault(require("../models/booking.model"));
const payment_model_1 = __importDefault(require("../models/payment.model"));
const models_1 = require("../models");
const db_1 = __importDefault(require("../configs/db"));
/**
 * @name findPaymentByOrderId
 * @description
 * Finds a payment record in the database using the Razorpay order ID.
 * This is used to correlate Razorpay events with our internal payment records.
 * @access Private
 */
const findPaymentByOrderId = (orderId) => __awaiter(void 0, void 0, void 0, function* () {
    return yield payment_model_1.default.findOne({
        where: { orderId: orderId },
    });
});
exports.findPaymentByOrderId = findPaymentByOrderId;
/**
 * @name findBookingByPaymentId
 * @description
 * Finds a booking record in the database using the associated payment ID.
 * This is used to correlate Razorpay events with our internal booking records after finding the payment record.
 * @access Private
 */
const findBookingByPaymentId = (paymentId) => __awaiter(void 0, void 0, void 0, function* () {
    return yield booking_model_1.default.findOne({
        where: { paymentId: paymentId },
    });
});
exports.findBookingByPaymentId = findBookingByPaymentId;
/**
 * @name getServiceAndUserContext
 * @description
 * Fetches the service name and user email associated with a given service ID and user ID.
 * This is used to build contextual information for logging payment events, such as payment failures, to provide more meaningful log messages that include the service name and user email.
 * @access Private
 */
const getServiceAndUserContext = (serviceId, userId) => __awaiter(void 0, void 0, void 0, function* () {
    const [service, user] = yield Promise.all([
        models_1.Service.findByPk(serviceId, { attributes: ["name"] }),
        models_1.User.findByPk(userId, { attributes: ["name", "email"] }),
    ]);
    return { service, user };
});
exports.getServiceAndUserContext = getServiceAndUserContext;
/**
 * @name updatePaymentAndBookingWithTransaction
 * @description
 * Performs a transactional update of both the payment and booking records. This ensures that both updates either succeed or fail together, maintaining data integrity.
 * The function takes the payment and booking instances along with their respective update data, and executes the updates within a single transaction.
 * @access Private
 */
const updatePaymentAndBookingWithTransaction = (payment, booking, paymentUpdate, bookingUpdate) => __awaiter(void 0, void 0, void 0, function* () {
    return yield db_1.default.transaction((transaction) => __awaiter(void 0, void 0, void 0, function* () {
        yield payment.update(paymentUpdate, { transaction });
        yield booking.update(bookingUpdate, { transaction });
    }));
});
exports.updatePaymentAndBookingWithTransaction = updatePaymentAndBookingWithTransaction;
/**
 * @name findPaymentById
 * @description
 * Finds a payment record in the database using its primary key ID.
 * @access Private
 */
const findPaymentById = (paymentId) => __awaiter(void 0, void 0, void 0, function* () {
    return yield payment_model_1.default.findByPk(paymentId);
});
exports.findPaymentById = findPaymentById;
/**
 * @name findBookingById
 * @description
 * Finds a booking record in the database using its primary key ID.
 * @access Private
 */
const findBookingById = (bookingId) => __awaiter(void 0, void 0, void 0, function* () {
    return yield booking_model_1.default.findByPk(bookingId);
});
exports.findBookingById = findBookingById;
/**
 * @name findServiceById
 * @description
 * Finds a service record in the database using its primary key ID and returns only the name attribute.
 * @access Private
 */
const findServiceById = (serviceId) => __awaiter(void 0, void 0, void 0, function* () {
    return yield models_1.Service.findByPk(serviceId, { attributes: ["name"] });
});
exports.findServiceById = findServiceById;
