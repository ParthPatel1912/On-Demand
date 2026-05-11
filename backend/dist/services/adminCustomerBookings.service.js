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
const sequelize_1 = require("sequelize");
const db_1 = __importDefault(require("../configs/db"));
const apiError_util_1 = require("../utils/apiError.util");
const servicePartner_enum_1 = require("../enums/servicePartner.enum");
const common_utils_1 = require("../utils/common.utils");
const adminBookingManagement_util_1 = require("../utils/adminBookingManagement.util");
const messages_1 = require("../constants/messages");
const enums_1 = require("../enums");
const AdminCustomerRepository = __importStar(require("../repositories/adminCustomer.repository"));
/**
 * @name getCustomerDetailById
 * @description Get Customer Details By ID.
 * @access Private
 */
const getCustomerDetailById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const customer = yield AdminCustomerRepository.findCustomerById(id);
    if (!customer) {
        throw new apiError_util_1.ApiError(enums_1.STATUS_CODE.NOT_FOUND, messages_1.MESSAGES.CUSTOMER.NOT_FOUND);
    }
    const result = {
        id: customer.id,
        name: customer.name,
        email: customer.email,
        mobileNumber: customer.mobileNumber,
        isActive: customer.isActive,
    };
    return result;
});
exports.getCustomerDetailById = getCustomerDetailById;
/**
 * @name getCustomerDetailById
 * @description List Custmore users with pagination, filtering and sorting.
 * @access Private
 */
const getCustomerBookingServices = (customerId, query) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
    const customer = yield AdminCustomerRepository.findCustomerById(customerId);
    if (!customer) {
        throw new apiError_util_1.ApiError(enums_1.STATUS_CODE.NOT_FOUND, messages_1.MESSAGES.CUSTOMER.NOT_FOUND);
    }
    const page = (_a = (0, common_utils_1.parseNumber)(query.page)) !== null && _a !== void 0 ? _a : 1;
    const limit = (_b = (0, common_utils_1.parseNumber)(query.limit)) !== null && _b !== void 0 ? _b : 10;
    const offset = (Number(page) - 1) * Number(limit);
    const serviceType = String((_c = query.serviceType) !== null && _c !== void 0 ? _c : "").trim();
    const date = String((_d = query.date) !== null && _d !== void 0 ? _d : "").trim();
    const time = String((_e = query.time) !== null && _e !== void 0 ? _e : "").trim();
    const paymentMethodInput = String((_f = query.paymentMethod) !== null && _f !== void 0 ? _f : "").trim();
    const paymentMethod = paymentMethodInput
        ? (0, adminBookingManagement_util_1.mapPaymentMethodFromLabel)(paymentMethodInput)
        : undefined;
    const status = (0, adminBookingManagement_util_1.mapBookingStatusToEnum)(query.status);
    const minAmount = (_g = (0, common_utils_1.parseNumber)(query.minAmount)) !== null && _g !== void 0 ? _g : undefined;
    const maxAmount = (_h = (0, common_utils_1.parseNumber)(query.maxAmount)) !== null && _h !== void 0 ? _h : undefined;
    const sortOrderRaw = String((_j = query.sortOrder) !== null && _j !== void 0 ? _j : "DESC").toUpperCase();
    const finalSortOrder = sortOrderRaw === "ASC" ? "ASC" : "DESC";
    const sortByRaw = String((_k = query.sortBy) !== null && _k !== void 0 ? _k : "bookingDate").trim();
    const sortMap = {
        bookingId: [["id", finalSortOrder]],
        serviceName: [["service", "name", finalSortOrder]],
        serviceType: [["serviceType", "name", finalSortOrder]],
        assignedExpert: [["servicePartner", "user", "name", finalSortOrder]],
        dateTime: [["bookingDate", finalSortOrder]],
        amount: [["amount", finalSortOrder]],
        paymentMethod: [["payment", "paymentMethod", finalSortOrder]],
        bookingStatus: [["status", finalSortOrder]],
    };
    const orderArray = (_l = sortMap[sortByRaw]) !== null && _l !== void 0 ? _l : sortMap.dateTime;
    const hasDate = Boolean(date);
    const hasTime = Boolean(time);
    // if (hasTime && !hasDate) {
    //   throw new ApiError(
    //     STATUS_CODE.BAD_REQUEST,
    //     MESSAGES.COMMON.TIME_ONLY_WITH_DATE
    //   );
    // }
    if (hasDate && !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        throw new apiError_util_1.ApiError(enums_1.STATUS_CODE.BAD_REQUEST, messages_1.MESSAGES.COMMON.INVALID_DATE_FORMAT);
    }
    if (hasTime && !/^(\d{1,2}):(\d{2})$/.test(time)) {
        throw new apiError_util_1.ApiError(enums_1.STATUS_CODE.BAD_REQUEST, messages_1.MESSAGES.COMMON.INVALID_TIME_FORMAT);
    }
    const whereCondition = {
        userId: customerId,
    };
    if (status)
        whereCondition.status = status;
    if (minAmount || maxAmount) {
        whereCondition.amount = Object.assign(Object.assign({}, (minAmount && { [sequelize_1.Op.gte]: Number(minAmount) })), (maxAmount && { [sequelize_1.Op.lte]: Number(maxAmount) }));
    }
    const andConditions = [];
    if (hasDate) {
        andConditions.push((0, sequelize_1.where)((0, sequelize_1.fn)("DATE", (0, sequelize_1.col)("booking_date")), date));
    }
    if (hasTime) {
        const [hours, minutes] = time.split(":").map(Number);
        andConditions.push(db_1.default.where(db_1.default.fn("EXTRACT", db_1.default.literal("HOUR FROM booking_date")), hours), db_1.default.where(db_1.default.fn("EXTRACT", db_1.default.literal("MINUTE FROM booking_date")), minutes));
    }
    if (andConditions.length) {
        whereCondition[sequelize_1.Op.and] = andConditions;
    }
    const { rows, count } = yield AdminCustomerRepository.findAllCustomerBookingServices(limit, offset, whereCondition, orderArray, serviceType, paymentMethod);
    const formattedBookings = rows.map((b) => {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u;
        return ({
            bookingId: b.id,
            serviceId: (_b = (_a = b.service) === null || _a === void 0 ? void 0 : _a.id) !== null && _b !== void 0 ? _b : null,
            serviceName: (_d = (_c = b.service) === null || _c === void 0 ? void 0 : _c.name) !== null && _d !== void 0 ? _d : null,
            serviceType: (_f = (_e = b.serviceType) === null || _e === void 0 ? void 0 : _e.name) !== null && _f !== void 0 ? _f : null,
            serviceAddress: (_g = b.serviceAddress) !== null && _g !== void 0 ? _g : null,
            dateTime: b.bookingDate ? (0, adminBookingManagement_util_1.formatDateTimeDetail)(b.bookingDate, { includeYear: true, includeComma: false }) : "",
            bookingStatus: b.status,
            paymentStatus: (_j = (_h = b.payment) === null || _h === void 0 ? void 0 : _h.paymentStatus) !== null && _j !== void 0 ? _j : null,
            paymentMethod: (_l = (_k = b.payment) === null || _k === void 0 ? void 0 : _k.paymentMethod) !== null && _l !== void 0 ? _l : "Unknown",
            amount: (_m = b.amount) !== null && _m !== void 0 ? _m : 0,
            assignedExpert: ((_o = b.servicePartner) === null || _o === void 0 ? void 0 : _o.verificationStatus) === servicePartner_enum_1.VerificationStatus.VERIFIED
                ? {
                    id: b.servicePartner.id,
                    name: (_q = (_p = b.servicePartner.user) === null || _p === void 0 ? void 0 : _p.name) !== null && _q !== void 0 ? _q : null,
                    profileImage: (_s = (_r = b.servicePartner.user) === null || _r === void 0 ? void 0 : _r.profileImage) !== null && _s !== void 0 ? _s : null,
                    mobileNumber: (_u = (_t = b.servicePartner.user) === null || _t === void 0 ? void 0 : _t.mobileNumber) !== null && _u !== void 0 ? _u : null,
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
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            limit,
        },
    };
});
exports.getCustomerBookingServices = getCustomerBookingServices;
