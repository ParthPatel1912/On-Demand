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
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBookingIdFromInvoice = exports.generateInvoiceNumber = exports.findBookingWithDetails = exports.findCustomerBookings = exports.findUserById = void 0;
const models_1 = require("../models");
const constants_1 = require("../constants");
const findUserById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    return yield models_1.User.findByPk(id);
});
exports.findUserById = findUserById;
const findCustomerBookings = (whereCondition, safePage, safeLimit) => __awaiter(void 0, void 0, void 0, function* () {
    const offset = (safePage - 1) * safeLimit;
    const options = {
        where: whereCondition,
        include: [
            {
                model: models_1.Service,
                as: "service",
                attributes: ["id", "name"],
            },
            {
                model: models_1.ServiceType,
                as: "serviceType",
                attributes: ["id", "name"],
                required: false,
            },
            {
                model: models_1.ServicePartner,
                as: "servicePartner",
                attributes: ["id", "verificationStatus"],
                required: false,
                include: [
                    {
                        model: models_1.User,
                        as: "user",
                        attributes: ["name", "mobileNumber", "profileImage"],
                    },
                    {
                        model: models_1.ServiceType,
                        as: "serviceType",
                        attributes: ["id", "name"],
                    },
                ],
            },
            {
                model: models_1.Payment,
                as: "payment",
                attributes: ["id", "paymentMethod", "paymentStatus"],
            },
        ],
        order: [
            ["bookingDate", "ASC"],
            ["id", "DESC"],
        ],
        limit: safeLimit,
        offset: offset,
        distinct: true,
    };
    const result = yield models_1.Booking.findAndCountAll(options);
    return {
        rows: result.rows,
        count: result.count,
    };
});
exports.findCustomerBookings = findCustomerBookings;
const findBookingWithDetails = (where_1, ...args_1) => __awaiter(void 0, [where_1, ...args_1], void 0, function* (where, additionalIncludes = []) {
    return (yield models_1.Booking.findOne({
        where,
        include: [
            { model: models_1.Service, as: "service" },
            {
                model: models_1.Payment,
                as: "payment",
                include: [{ model: models_1.Offer, as: "offer" }]
            },
            {
                model: models_1.ServicePartner,
                as: "servicePartner",
                attributes: ["id", "verificationStatus"],
                include: [
                    {
                        model: models_1.User,
                        as: "user",
                        attributes: ["name", "mobileNumber", "profileImage", "countryCode"]
                    },
                    {
                        model: models_1.ServiceType,
                        as: "serviceType",
                        attributes: ["id", "name"]
                    }
                ],
            },
            {
                model: models_1.User,
                as: "customer",
                attributes: ["name"]
            },
            ...additionalIncludes,
        ],
    }));
});
exports.findBookingWithDetails = findBookingWithDetails;
const generateInvoiceNumber = (bookingId) => {
    return `${constants_1.INVOICE_PREFIX}${constants_1.INVOICE_BASE_NUM + bookingId}`;
};
exports.generateInvoiceNumber = generateInvoiceNumber;
const getBookingIdFromInvoice = (invoiceNumber) => {
    return (parseInt(invoiceNumber.replace(constants_1.INVOICE_PREFIX, ""), 10) - constants_1.INVOICE_BASE_NUM);
};
exports.getBookingIdFromInvoice = getBookingIdFromInvoice;
