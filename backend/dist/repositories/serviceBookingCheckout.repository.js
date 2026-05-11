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
exports.updateBookingAndPaymentWithTransaction = exports.findPaymentById = exports.findBookingById = exports.findBookingWithPayment = exports.updatePayment = exports.createBookingAndPaymentWithTransaction = exports.findPartnerById = exports.findUserById = exports.findAddressById = exports.findOfferById = exports.findCategoryWithServiceType = exports.findServiceWithContext = exports.findBookingByPaymentId = exports.findPendingPayment = exports.findPaidPayment = exports.findRelevantBookings = exports.findEligiblePartners = void 0;
const sequelize_1 = require("sequelize");
const models_1 = require("../models");
const transaction_enum_1 = require("../enums/transaction.enum");
const servicePartner_enum_1 = require("../enums/servicePartner.enum");
const db_1 = __importDefault(require("../configs/db"));
/**
 * Finds eligible service partners for a specific category.
 */
const findEligiblePartners = (subCategoryId) => __awaiter(void 0, void 0, void 0, function* () {
    return yield models_1.ServicePartner.findAll({
        where: {
            status: servicePartner_enum_1.ServicePartnerStatus.ACTIVE,
            verificationStatus: servicePartner_enum_1.VerificationStatus.VERIFIED,
        },
        include: [
            {
                model: models_1.ServicePartnerService,
                as: "services",
                where: { subCategoryId },
                required: true,
            },
        ],
        attributes: ["id"],
    });
});
exports.findEligiblePartners = findEligiblePartners;
/**
 * Finds all relevant bookings for a list of partner IDs.
 */
const findRelevantBookings = (partnerIds) => __awaiter(void 0, void 0, void 0, function* () {
    return yield models_1.Booking.findAll({
        where: {
            servicePartnerId: { [sequelize_1.Op.in]: partnerIds },
            status: {
                [sequelize_1.Op.in]: [transaction_enum_1.BookingStatus.PENDING],
            },
        },
        attributes: ["servicePartnerId", "bookingDate", "serviceDuration"],
    });
});
exports.findRelevantBookings = findRelevantBookings;
/**
 * Finds a paid payment record for a specific user, service, and slot.
 */
const findPaidPayment = (userId, serviceId, slot) => __awaiter(void 0, void 0, void 0, function* () {
    return yield models_1.Payment.findOne({
        where: {
            userId,
            serviceId,
            slot,
            paymentStatus: transaction_enum_1.PaymentStatus.PAID,
        },
    });
});
exports.findPaidPayment = findPaidPayment;
/**
 * Finds a pending payment record for a specific user, service, and slot.
 */
const findPendingPayment = (userId, serviceId, slot) => __awaiter(void 0, void 0, void 0, function* () {
    return yield models_1.Payment.findOne({
        where: {
            userId,
            serviceId,
            paymentStatus: transaction_enum_1.PaymentStatus.PENDING,
            slot: {
                [sequelize_1.Op.contains]: slot,
            },
        },
        order: [["createdAt", "DESC"]],
    });
});
exports.findPendingPayment = findPendingPayment;
/**
 * Finds a booking by its associated payment ID.
 */
const findBookingByPaymentId = (paymentId) => __awaiter(void 0, void 0, void 0, function* () {
    return yield models_1.Booking.findOne({
        where: { paymentId },
    });
});
exports.findBookingByPaymentId = findBookingByPaymentId;
/**
 * Finds a service with its full category and service type context.
 */
const findServiceWithContext = (serviceId) => __awaiter(void 0, void 0, void 0, function* () {
    return yield models_1.Service.findByPk(serviceId, {
        include: [
            {
                model: models_1.SubCategory,
                as: "subCategory",
                attributes: ["id"],
                required: false,
                include: [
                    {
                        model: models_1.Category,
                        as: "category",
                        attributes: ["id"],
                        required: false,
                        include: [
                            {
                                model: models_1.ServiceType,
                                as: "serviceType",
                                attributes: ["id", "name"],
                                required: false,
                            },
                        ],
                    },
                ],
            },
        ],
    });
});
exports.findServiceWithContext = findServiceWithContext;
/**
 * Finds a category with its associated service type.
 */
const findCategoryWithServiceType = (categoryId) => __awaiter(void 0, void 0, void 0, function* () {
    return yield models_1.Category.findByPk(categoryId, {
        attributes: ["id"],
        include: [
            {
                model: models_1.ServiceType,
                as: "serviceType",
                attributes: ["id"],
                required: true,
            },
        ],
    });
});
exports.findCategoryWithServiceType = findCategoryWithServiceType;
/**
 * Finds an offer by its primary key.
 */
const findOfferById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    return yield models_1.Offer.findByPk(id);
});
exports.findOfferById = findOfferById;
/**
 * Finds an address by its primary key.
 */
const findAddressById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    return yield models_1.Address.findByPk(id);
});
exports.findAddressById = findAddressById;
/**
 * Finds a user by its primary key.
 */
const findUserById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    return yield models_1.User.findByPk(id);
});
exports.findUserById = findUserById;
/**
 * Finds a partner by its primary key.
 */
const findPartnerById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    return yield models_1.ServicePartner.findByPk(id);
});
exports.findPartnerById = findPartnerById;
/**
 * Performs a transactional creation of both booking and payment records.
 */
const createBookingAndPaymentWithTransaction = (bookingData, paymentData) => __awaiter(void 0, void 0, void 0, function* () {
    return yield db_1.default.transaction((transaction) => __awaiter(void 0, void 0, void 0, function* () {
        const booking = yield models_1.Booking.create(bookingData, { transaction });
        const payment = yield models_1.Payment.create(Object.assign(Object.assign({}, paymentData), { bookingStatus: transaction_enum_1.BookingStatus.PENDING }), { transaction });
        yield booking.update({ paymentId: payment.id }, { transaction });
        return { booking, payment };
    }));
});
exports.createBookingAndPaymentWithTransaction = createBookingAndPaymentWithTransaction;
/**
 * Updates a payment record.
 */
const updatePayment = (paymentId, data) => __awaiter(void 0, void 0, void 0, function* () {
    return yield models_1.Payment.update(data, { where: { id: paymentId } });
});
exports.updatePayment = updatePayment;
/**
 * Retrieves a booking record along with its associated payment details.
 */
const findBookingWithPayment = (bookingId) => __awaiter(void 0, void 0, void 0, function* () {
    return yield models_1.Booking.findOne({
        where: { id: bookingId },
        include: [
            {
                model: models_1.Payment,
                as: "payment",
                attributes: [
                    "slot",
                    "addressId",
                    "paymentMethod",
                    "paymentGateway",
                    "paymentStatus",
                    "sessionId",
                    "orderId",
                    "paymentIntentId",
                    "clientSecret",
                    "couponId",
                    "currency",
                    "totalAmount",
                ],
            },
        ],
        attributes: [
            "id",
            "userId",
            "paymentId",
            "serviceId",
            "servicePartnerId",
            "bookingDate",
            "status",
            "serviceDuration",
            "expiresAt",
            "cancellationReason",
            "amount",
        ],
    });
});
exports.findBookingWithPayment = findBookingWithPayment;
/**
 * Finds a booking by its primary key.
 */
const findBookingById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    return yield models_1.Booking.findByPk(id);
});
exports.findBookingById = findBookingById;
/**
 * Finds a payment by its primary key.
 */
const findPaymentById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    return yield models_1.Payment.findByPk(id);
});
exports.findPaymentById = findPaymentById;
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
