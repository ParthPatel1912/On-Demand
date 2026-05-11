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
exports.initBookingCleanupJob = void 0;
const node_cron_1 = __importDefault(require("node-cron"));
const sequelize_1 = require("sequelize");
const models_1 = require("../models");
const transaction_enum_1 = require("../enums/transaction.enum");
const logger_1 = __importDefault(require("../utils/logger"));
const db_1 = __importDefault(require("../configs/db"));
const payment_logger_1 = require("../services/logger/payment.logger");
const adminBookingManagement_util_1 = require("../utils/adminBookingManagement.util");
/**
 * Booking Expiry & Cleanup Job
 * Runs every 1 minute to find and delete expired CARD bookings with PENDING payment status.
 */
const initBookingCleanupJob = () => {
    node_cron_1.default.schedule("* * * * *", () => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const now = new Date();
            // Find bookings that have expired
            // Filter for CARD payment method and PENDING payment status via association
            const expiredBookings = yield models_1.Booking.findAll({
                where: {
                    expiresAt: {
                        [sequelize_1.Op.lt]: now,
                    },
                },
                include: [
                    {
                        model: models_1.Payment,
                        as: "payment",
                        where: {
                            paymentStatus: transaction_enum_1.PaymentStatus.PENDING,
                            paymentMethod: transaction_enum_1.PaymentMethod.CARD,
                        },
                        required: true,
                    },
                ],
            });
            if (expiredBookings.length === 0) {
                return;
            }
            for (const booking of expiredBookings) {
                try {
                    const service = yield models_1.Service.findOne({
                        where: {
                            id: booking.serviceId,
                        },
                        attributes: ["name"],
                    });
                    yield db_1.default.transaction((transaction) => __awaiter(void 0, void 0, void 0, function* () {
                        // Failed related Payment if it exists and is still PENDING
                        if (booking.paymentId) {
                            yield models_1.Payment.update({
                                paymentStatus: transaction_enum_1.PaymentStatus.FAILED,
                                bookingStatus: transaction_enum_1.BookingStatus.CANCELLED,
                            }, {
                                where: {
                                    id: booking.paymentId,
                                    paymentStatus: transaction_enum_1.PaymentStatus.PENDING,
                                },
                                transaction,
                            });
                        }
                        // Cancelled Booking record
                        yield booking.update({
                            status: transaction_enum_1.BookingStatus.CANCELLED,
                        }, {
                            transaction,
                        });
                    }));
                    (0, payment_logger_1.logPaymentFailed)({
                        bookingId: booking.id,
                        metadata: { userId: booking.userId, serviceId: booking.serviceId },
                        message: `Booking${(service === null || service === void 0 ? void 0 : service.name) ? ` of ${service === null || service === void 0 ? void 0 : service.name}` : ""} was cancelled due to late payment and has expired ${(booking === null || booking === void 0 ? void 0 : booking.expiresAt)
                            ? ` at ${(0, adminBookingManagement_util_1.formatDateTimeDetail)(booking.expiresAt)}`
                            : ""}`,
                    });
                }
                catch (bookingError) {
                    logger_1.default.error(`Failed to clean up booking ID: ${booking.id}`, bookingError);
                }
            }
        }
        catch (error) {
            logger_1.default.error("Error in Booking Expiry & Cleanup Job:", error);
        }
    }));
};
exports.initBookingCleanupJob = initBookingCleanupJob;
