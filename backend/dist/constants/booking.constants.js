"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RETRIED_BOOKING_STATUS = exports.RETRIED_PAYMENT_STATUS = exports.EXPIRED_MINUTES = exports.MIN_BOOKING_BEFORE_BUFFER_TIME = exports.MIN_BOOKING_BEFORE_BUFFER = exports.MAX_BUFFER_MINUTES = exports.SLOT_END_MINUTES = exports.SLOT_START_MINUTES = exports.INVOICE_BASE_NUM = exports.INVOICE_PREFIX = void 0;
const transaction_enum_1 = require("../enums/transaction.enum");
exports.INVOICE_PREFIX = "INV-";
exports.INVOICE_BASE_NUM = 1000;
exports.SLOT_START_MINUTES = 9 * 60; // 9:00 AM
exports.SLOT_END_MINUTES = 19 * 60; // 7:00 PM
exports.MAX_BUFFER_MINUTES = 60;
exports.MIN_BOOKING_BEFORE_BUFFER = 30;
exports.MIN_BOOKING_BEFORE_BUFFER_TIME = 30 * 60000;
exports.EXPIRED_MINUTES = 10;
exports.RETRIED_PAYMENT_STATUS = [
    transaction_enum_1.PaymentStatus.FAILED,
    transaction_enum_1.PaymentStatus.PENDING,
];
exports.RETRIED_BOOKING_STATUS = [
    transaction_enum_1.BookingStatus.CANCELLED,
    transaction_enum_1.BookingStatus.PENDING,
];
