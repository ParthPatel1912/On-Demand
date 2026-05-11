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
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMyBookings = exports.getAvailabilitySlotsByService = exports.getInvoiceData = exports.getBookingSuccessDetails = void 0;
const models_1 = require("../models");
const apiError_util_1 = require("../utils/apiError.util");
const servicePartner_enum_1 = require("../enums/servicePartner.enum");
const sequelize_1 = require("sequelize");
const transaction_enum_1 = require("../enums/transaction.enum");
const enums_1 = require("../enums");
const log_enum_1 = require("../enums/log.enum");
const common_utils_1 = require("../utils/common.utils");
const messages_1 = require("../constants/messages");
const BookingRepository = __importStar(require("../repositories/booking.repository"));
const constants_1 = require("../constants");
/**
 * Get booking success details and handle partner assignment
 */
const getBookingSuccessDetails = (bookingId) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d;
    let booking = yield BookingRepository.findBookingWithDetails({ id: bookingId });
    if (!booking) {
        throw new apiError_util_1.ApiError(enums_1.STATUS_CODE.NOT_FOUND, messages_1.MESSAGES.BOOKING.NOT_FOUND);
    }
    const service = booking.service;
    const payment = booking.payment;
    // 1. Assignment Logic (if not already assigned)  
    if (!booking.servicePartnerId && booking.status === transaction_enum_1.BookingStatus.PENDING) {
        const subCategoryId = service === null || service === void 0 ? void 0 : service.subCategoryId;
        if (subCategoryId) {
            // Find eligible partners
            const eligiblePartners = yield models_1.ServicePartner.findAll({
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
            });
            const availablePartners = [];
            const newBookingStart = new Date(booking.bookingDate).getTime();
            const newBookingEnd = new Date(newBookingStart + (booking.serviceDuration || 0) * constants_1.MS_IN_MINUTE).getTime();
            const partnerIds = eligiblePartners.map(p => p.id);
            // Fetch all relevant bookings for all eligible partners
            const allActiveBookings = yield models_1.Booking.findAll({
                where: {
                    servicePartnerId: { [sequelize_1.Op.in]: partnerIds },
                    status: { [sequelize_1.Op.in]: [transaction_enum_1.BookingStatus.PENDING, transaction_enum_1.BookingStatus.CONFIRMED] },
                    id: { [sequelize_1.Op.ne]: bookingId }
                }
            });
            // Group bookings by partnerId for efficient access
            const partnerBookingsMap = allActiveBookings.reduce((acc, b) => {
                if (!acc[b.servicePartnerId])
                    acc[b.servicePartnerId] = [];
                acc[b.servicePartnerId].push(b);
                return acc;
            }, {});
            for (const partner of eligiblePartners) {
                const theirBookings = partnerBookingsMap[partner.id] || [];
                const isOverlapping = theirBookings.some((b) => {
                    const bStart = new Date(b.bookingDate).getTime();
                    const bEnd = new Date(bStart + (b.serviceDuration || 0) * constants_1.MS_IN_MINUTE).getTime();
                    return newBookingStart < bEnd && newBookingEnd > bStart;
                });
                if (!isOverlapping) {
                    availablePartners.push(partner);
                }
            }
            if (availablePartners.length > 0) {
                const randomIdx = Math.floor(Math.random() * availablePartners.length);
                yield booking.update({ servicePartnerId: availablePartners[randomIdx].id });
                // Reload to get updated partner info
                booking = yield BookingRepository.findBookingWithDetails({ id: bookingId });
            }
        }
    }
    if (!booking) {
        throw new apiError_util_1.ApiError(enums_1.STATUS_CODE.NOT_FOUND, messages_1.MESSAGES.BOOKING.NOT_FOUND);
    }
    const assignedPartner = booking.servicePartner;
    const servicePartner = assignedPartner ? {
        name: ((_a = assignedPartner.user) === null || _a === void 0 ? void 0 : _a.name) || assignedPartner.name,
        phone: ((_b = assignedPartner.user) === null || _b === void 0 ? void 0 : _b.mobileNumber) || assignedPartner.mobileNumber,
        image: ((_c = assignedPartner.user) === null || _c === void 0 ? void 0 : _c.profileImage) || assignedPartner.profileImage,
        isVerified: assignedPartner.verificationStatus === servicePartner_enum_1.VerificationStatus.VERIFIED,
        serviceTypeName: ((_d = assignedPartner.serviceType) === null || _d === void 0 ? void 0 : _d.name) || "Service Partner"
    } : undefined;
    const bookingDate = new Date(booking.bookingDate);
    // Formatting helpers
    const day = bookingDate.getDate();
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const month = monthNames[bookingDate.getMonth()];
    let hours = bookingDate.getHours();
    const minutes = bookingDate.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    const strMinutes = minutes < 10 ? '0' + minutes : minutes;
    const timeStr = `${hours}:${strMinutes} ${ampm}`;
    const invoiceNumber = BookingRepository.generateInvoiceNumber(booking.id);
    return {
        bookingId: String(booking.id),
        bookingStatus: booking.status.toUpperCase(),
        headerTitle: "Your booking is confirmed.",
        serviceName: (service === null || service === void 0 ? void 0 : service.name) || "N/A",
        serviceDuration: `${booking.serviceDuration || 0} Min`,
        assignmentStatus: booking.servicePartnerId ? "SERVICE_PARTNER_ASSIGNED" : "ASSIGNING_SERVICE_PARTNER",
        servicePartner,
        amountPaid: Number((payment === null || payment === void 0 ? void 0 : payment.totalAmount) || booking.amount || 0),
        currency: (payment === null || payment === void 0 ? void 0 : payment.currency) || log_enum_1.CurrencyValueSymbol.USD,
        invoiceNumber: invoiceNumber,
        invoiceDownloadUrl: `/api/bookings/invoice/${invoiceNumber}`,
        selectedAddress: booking.serviceAddress || "N/A",
        selectedDate: bookingDate.toISOString().split('T')[0],
        selectedTime: `${bookingDate.getHours().toString().padStart(2, '0')}:${bookingDate.getMinutes().toString().padStart(2, '0')}`,
        displayDateTime: `${day} ${month}, ${timeStr}`,
    };
});
exports.getBookingSuccessDetails = getBookingSuccessDetails;
/**
 * Download invoice logic
 */
const getInvoiceData = (invoiceNumber, userId) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d;
    const bookingId = BookingRepository.getBookingIdFromInvoice(invoiceNumber);
    const booking = yield BookingRepository.findBookingWithDetails({ id: bookingId, userId });
    if (!booking) {
        throw new apiError_util_1.ApiError(enums_1.STATUS_CODE.NOT_FOUND, messages_1.MESSAGES.TRANSACTION.INVOICE_NOT_FOUND);
    }
    const service = booking.service;
    const payment = booking.payment;
    const partner = booking.servicePartner;
    const customer = booking.customer;
    const subTotal = Number((payment === null || payment === void 0 ? void 0 : payment.amount) || booking.amount || 0);
    const discount = Number((payment === null || payment === void 0 ? void 0 : payment.discount) || 0);
    const totalAmount = Number((payment === null || payment === void 0 ? void 0 : payment.totalAmount) || booking.amount || 0);
    const taxable = subTotal - discount;
    const tax = Number((totalAmount - taxable).toFixed(2));
    const currency = (payment === null || payment === void 0 ? void 0 : payment.currency) || "INR";
    return {
        invoiceNumber,
        bookingId: booking.id,
        customerName: (customer === null || customer === void 0 ? void 0 : customer.name) || "Valued Customer",
        customerAddress: booking.serviceAddress || "N/A",
        serviceName: (_a = service === null || service === void 0 ? void 0 : service.name) !== null && _a !== void 0 ? _a : "N/A",
        serviceDescription: (service === null || service === void 0 ? void 0 : service.description) || (service === null || service === void 0 ? void 0 : service.name),
        servicePartnerName: ((_b = partner === null || partner === void 0 ? void 0 : partner.user) === null || _b === void 0 ? void 0 : _b.name) || (partner === null || partner === void 0 ? void 0 : partner.name),
        servicePartnerPhone: partner === null || partner === void 0 ? void 0 : partner.mobileNumber,
        subTotal,
        tax,
        discount,
        totalAmount,
        currency,
        date: booking.bookingDate,
        status: (_c = payment === null || payment === void 0 ? void 0 : payment.paymentStatus) !== null && _c !== void 0 ? _c : "PAID",
        couponCode: (_d = payment === null || payment === void 0 ? void 0 : payment.offer) === null || _d === void 0 ? void 0 : _d.couponCode,
        serviceDuration: booking.serviceDuration || 0,
    };
});
exports.getInvoiceData = getInvoiceData;
const getAvailabilitySlotsByService = (serviceId) => __awaiter(void 0, void 0, void 0, function* () {
    if (!serviceId || Number.isNaN(serviceId)) {
        throw new apiError_util_1.ApiError(enums_1.STATUS_CODE.BAD_REQUEST, messages_1.MESSAGES.SERVICE.INVALID_ID);
    }
    const service = yield models_1.Service.findOne({
        where: { id: serviceId },
        attributes: ["id", "duration"],
    });
    const duration = (service === null || service === void 0 ? void 0 : service.duration) || 0;
    if (!duration || Number.isNaN(duration)) {
        throw new apiError_util_1.ApiError(enums_1.STATUS_CODE.BAD_REQUEST, messages_1.MESSAGES.COMMON.INVALID_DURATION);
    }
    const now = new Date();
    // Precompute buffer & interval
    const buffer = Math.min(duration / 2, constants_1.MAX_BUFFER_MINUTES);
    const interval = duration + buffer;
    const result = [];
    for (let i = 0; i < 7; i++) {
        const currentDate = new Date(now);
        currentDate.setDate(now.getDate() + i);
        const dateStr = currentDate.toISOString().split("T")[0];
        const isToday = currentDate.toDateString() === now.toDateString();
        if (isToday) {
            const currentMinutes = now.getHours() * 60 + now.getMinutes();
            if (currentMinutes >= constants_1.SLOT_END_MINUTES) {
                continue;
            }
        }
        const times = [];
        for (let time = constants_1.SLOT_START_MINUTES; time <= constants_1.SLOT_END_MINUTES; time += interval) {
            const slotStart = new Date(currentDate);
            slotStart.setHours(Math.floor(time / 60), time % 60, 0, 0);
            const roundedTime = (0, common_utils_1.roundUpToNextQuarter)(slotStart);
            if (isToday && roundedTime < new Date(now.getTime() + constants_1.MIN_BOOKING_BEFORE_BUFFER_TIME)) {
                continue;
            }
            const hour = roundedTime.getHours();
            const minute = roundedTime.getMinutes();
            const period = hour >= 12 ? "PM" : "AM";
            let displayHour = hour % 12;
            if (displayHour === 0)
                displayHour = 12;
            const timeStr = `${displayHour}:${minute
                .toString()
                .padStart(2, "0")} ${period}`;
            times.push({
                time: timeStr,
                disabled: false,
            });
        }
        const isFullyOccupied = times.length === 0;
        result.push({
            date: dateStr,
            isFullyOccupied,
            times,
        });
    }
    return result;
});
exports.getAvailabilitySlotsByService = getAvailabilitySlotsByService;
/**
 * @name getMyBookings
 * @description Get customer bookings based on Upcoming or Completed tab. Logic is based on bookingDate (NOT status).
 * @access Private
 */
const getMyBookings = (userId, tab, page, limit) => __awaiter(void 0, void 0, void 0, function* () {
    if (!userId) {
        throw new apiError_util_1.ApiError(enums_1.STATUS_CODE.BAD_REQUEST, messages_1.MESSAGES.BOOKING.USER_ID_REQUIRED);
    }
    const user = yield BookingRepository.findUserById(userId);
    if (!user) {
        throw new apiError_util_1.ApiError(enums_1.STATUS_CODE.NOT_FOUND, messages_1.MESSAGES.BOOKING.USER_NOT_FOUND);
    }
    const safePage = Math.max(1, page || 1);
    const safeLimit = Math.max(1, limit || 10);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const whereCondition = { userId };
    if (tab === transaction_enum_1.MyBookingTab.UPCOMING) {
        whereCondition.bookingDate = { [sequelize_1.Op.gte]: today };
    }
    else if (tab === transaction_enum_1.MyBookingTab.COMPLETED) {
        whereCondition.bookingDate = { [sequelize_1.Op.lt]: today };
    }
    const { rows, count } = yield BookingRepository.findCustomerBookings(whereCondition, safePage, safeLimit);
    const formattedBookings = rows.map((b) => {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p;
        return ({
            id: b.id,
            serviceName: (_b = (_a = b.service) === null || _a === void 0 ? void 0 : _a.name) !== null && _b !== void 0 ? _b : null,
            duration: (_c = b.serviceDuration) !== null && _c !== void 0 ? _c : null,
            bookingDate: b.bookingDate ? new Date(b.bookingDate).getTime() : null,
            address: (_d = b.serviceAddress) !== null && _d !== void 0 ? _d : null,
            amount: Number((_e = b.amount) !== null && _e !== void 0 ? _e : 0),
            status: b.status,
            invoiceNumber: BookingRepository.generateInvoiceNumber(b.id),
            invoiceDownloadUrl: `/api/bookings/invoice/${BookingRepository.generateInvoiceNumber(b.id)}`,
            servicePartner: ((_f = b.servicePartner) === null || _f === void 0 ? void 0 : _f.verificationStatus) === servicePartner_enum_1.VerificationStatus.VERIFIED
                ? {
                    id: b.servicePartner.id,
                    name: (_h = (_g = b.servicePartner.user) === null || _g === void 0 ? void 0 : _g.name) !== null && _h !== void 0 ? _h : null,
                    mobileNumber: (_k = (_j = b.servicePartner.user) === null || _j === void 0 ? void 0 : _j.mobileNumber) !== null && _k !== void 0 ? _k : null,
                    countryCode: (_m = (_l = b.servicePartner.user) === null || _l === void 0 ? void 0 : _l.countryCode) !== null && _m !== void 0 ? _m : null,
                    profileImage: (_p = (_o = b.servicePartner.user) === null || _o === void 0 ? void 0 : _o.profileImage) !== null && _p !== void 0 ? _p : null,
                    verificationStatus: b.servicePartner.verificationStatus,
                    serviceType: b.servicePartner.serviceType
                        ? {
                            id: b.servicePartner.serviceType.id,
                            name: b.servicePartner.serviceType.name,
                        }
                        : null,
                }
                : null,
        });
    });
    return {
        bookings: formattedBookings,
        pagination: {
            totalItems: count,
            totalPages: Math.ceil(count / safeLimit),
            currentPage: safePage,
            limit: safeLimit,
        },
    };
});
exports.getMyBookings = getMyBookings;
