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
exports.getAdminBookingDetailsPageData = exports.getAdminBookingDetails = void 0;
const adminBookingManagement_repository_1 = require("../repositories/adminBookingManagement.repository");
const logger_service_1 = require("../services/logger.service");
const apiError_util_1 = require("../utils/apiError.util");
const enums_1 = require("../enums");
const messages_1 = require("../constants/messages");
const adminBookingManagement_util_1 = require("../utils/adminBookingManagement.util");
const transaction_enum_1 = require("../enums/transaction.enum");
const toNumber = (value) => {
    if (value === null || value === undefined)
        return undefined;
    if (typeof value === "number" && Number.isFinite(value))
        return value;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
};
const getAdminBookingDetails = (bookingId) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0, _1, _2, _3, _4, _5, _6, _7, _8, _9, _10, _11, _12, _13, _14, _15, _16, _17, _18, _19, _20;
    if (!Number.isFinite(bookingId) || bookingId <= 0) {
        throw new apiError_util_1.ApiError(enums_1.STATUS_CODE.BAD_REQUEST, messages_1.MESSAGES.BOOKING.INVALID_ID);
    }
    const booking = yield adminBookingManagement_repository_1.adminBookingManagementRepository.getAdminBookingDetailsById(bookingId);
    if (!booking) {
        throw new apiError_util_1.ApiError(enums_1.STATUS_CODE.NOT_FOUND, messages_1.MESSAGES.BOOKING.NOT_FOUND);
    }
    const serviceCommissionPercent = (_b = toNumber((_a = booking.service) === null || _a === void 0 ? void 0 : _a.commission)) !== null && _b !== void 0 ? _b : 0;
    const amount = (_e = toNumber((_d = (_c = booking.payment) === null || _c === void 0 ? void 0 : _c.amount) !== null && _d !== void 0 ? _d : booking.amount)) !== null && _e !== void 0 ? _e : 0;
    const currency = String((_g = (_f = booking.payment) === null || _f === void 0 ? void 0 : _f.currency) !== null && _g !== void 0 ? _g : "").trim() || "INR";
    const commissionAmount = Number(((amount * serviceCommissionPercent) / 100).toFixed(2));
    const partnerPayout = Number((amount - commissionAmount).toFixed(2));
    const subtotal = (_j = toNumber((_h = booking.payment) === null || _h === void 0 ? void 0 : _h.amount)) !== null && _j !== void 0 ? _j : amount;
    const tax = (_l = toNumber((_k = booking.payment) === null || _k === void 0 ? void 0 : _k.tax)) !== null && _l !== void 0 ? _l : 0;
    const discount = (_o = toNumber((_m = booking.payment) === null || _m === void 0 ? void 0 : _m.discount)) !== null && _o !== void 0 ? _o : 0;
    const total = (_q = toNumber((_p = booking.payment) === null || _p === void 0 ? void 0 : _p.totalAmount)) !== null && _q !== void 0 ? _q : amount;
    const paymentStatus = (_r = booking.payment) === null || _r === void 0 ? void 0 : _r.paymentStatus;
    const paid = paymentStatus === transaction_enum_1.PaymentStatus.PAID ? total : 0;
    const paymentTransactionId = ((_s = booking.payment) === null || _s === void 0 ? void 0 : _s.paymentIntentId) ||
        ((_t = booking.payment) === null || _t === void 0 ? void 0 : _t.orderId) ||
        ((_u = booking.payment) === null || _u === void 0 ? void 0 : _u.sessionId);
    const details = {
        bookingId: String(booking.id),
        status: String((_v = booking.status) !== null && _v !== void 0 ? _v : ""),
        serviceId: booking.serviceId ? String(booking.serviceId) : undefined,
        serviceName: (_x = (_w = booking.service) === null || _w === void 0 ? void 0 : _w.name) !== null && _x !== void 0 ? _x : undefined,
        serviceType: (_z = (_y = booking.serviceType) === null || _y === void 0 ? void 0 : _y.name) !== null && _z !== void 0 ? _z : undefined,
        scheduledAt: booking.bookingDate
            ? (0, adminBookingManagement_util_1.formatDateTimeDetail)(new Date(booking.bookingDate), {
                includeYear: true,
            })
            : undefined,
        createdAt: booking.createdAt
            ? (0, adminBookingManagement_util_1.formatDateTimeDetail)(new Date(booking.createdAt), {
                includeYear: true,
            })
            : undefined,
        cancellationReason: (_0 = booking.cancellationReason) !== null && _0 !== void 0 ? _0 : undefined,
        customer: booking.customer
            ? {
                id: (_1 = booking.customer) === null || _1 === void 0 ? void 0 : _1.id,
                name: (_2 = booking.customer) === null || _2 === void 0 ? void 0 : _2.name,
                email: (_3 = booking.customer) === null || _3 === void 0 ? void 0 : _3.email,
                phone: (_4 = booking.customer) === null || _4 === void 0 ? void 0 : _4.mobileNumber,
                avatar: (_5 = booking.customer) === null || _5 === void 0 ? void 0 : _5.profileImage,
            }
            : undefined,
        servicePartner: ((_6 = booking.servicePartner) === null || _6 === void 0 ? void 0 : _6.user)
            ? {
                id: (_7 = booking.servicePartner) === null || _7 === void 0 ? void 0 : _7.id,
                name: ((_9 = (_8 = booking.servicePartner) === null || _8 === void 0 ? void 0 : _8.user) === null || _9 === void 0 ? void 0 : _9.name) || "Unknown",
                email: (_11 = (_10 = booking.servicePartner) === null || _10 === void 0 ? void 0 : _10.user) === null || _11 === void 0 ? void 0 : _11.email,
                phone: (_13 = (_12 = booking.servicePartner) === null || _12 === void 0 ? void 0 : _12.user) === null || _13 === void 0 ? void 0 : _13.mobileNumber,
                avatar: (_15 = (_14 = booking.servicePartner) === null || _14 === void 0 ? void 0 : _14.user) === null || _15 === void 0 ? void 0 : _15.profileImage,
            }
            : undefined,
        payment: booking.payment
            ? {
                paymentStatus: ((_16 = booking.payment) === null || _16 === void 0 ? void 0 : _16.paymentStatus) || transaction_enum_1.PaymentStatus.PENDING,
                paymentMethod: (_17 = booking.payment) === null || _17 === void 0 ? void 0 : _17.paymentMethod,
                paymentGateway: (_18 = booking.payment) === null || _18 === void 0 ? void 0 : _18.paymentGateway,
                transactionId: paymentTransactionId
                    ? String(paymentTransactionId)
                    : undefined,
                paidAt: ((_19 = booking.payment) === null || _19 === void 0 ? void 0 : _19.paidAt)
                    ? (0, adminBookingManagement_util_1.formatDateTimeDetail)(new Date((_20 = booking.payment) === null || _20 === void 0 ? void 0 : _20.paidAt), {
                        includeYear: true,
                    })
                    : undefined,
            }
            : undefined,
        charges: {
            servicePartnerCharges: amount,
            commissionAmount,
            commissionPercent: serviceCommissionPercent,
            partnerPayout,
            currency,
        },
        customerPayment: {
            subtotal,
            tax,
            discount,
            total,
            paid,
            currency,
        },
    };
    return details;
});
exports.getAdminBookingDetails = getAdminBookingDetails;
const getAdminBookingDetailsPageData = (params) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const errors = {};
    //Normalize once
    const page = Number(params.page) || 1;
    const limit = Number(params.limit) || 10;
    const sortBy = typeof params.sortBy === "string" ? params.sortBy : "createdAt";
    const sortOrder = params.sortOrder === "ASC" || params.sortOrder === "DESC"
        ? params.sortOrder
        : "DESC";
    try {
        const logsRes = yield (0, logger_service_1.getLogsService)({
            page,
            limit,
            sortBy,
            sortOrder,
            bookingId: String(params.bookingId),
        });
        return {
            data: {
                logs: (_a = logsRes.data) !== null && _a !== void 0 ? _a : [],
                logsPagination: (_b = logsRes.pagination) !== null && _b !== void 0 ? _b : {
                    totalItems: 0,
                    currentPage: page,
                    totalPages: 0,
                    limit,
                },
            },
            errors,
        };
    }
    catch (e) {
        return {
            data: {
                logs: [],
                logsPagination: {
                    totalItems: 0,
                    currentPage: page,
                    totalPages: 0,
                    limit,
                },
            },
            errors: {
                logs: e instanceof Error ? e.message : "Failed to fetch logs",
            },
        };
    }
});
exports.getAdminBookingDetailsPageData = getAdminBookingDetailsPageData;
