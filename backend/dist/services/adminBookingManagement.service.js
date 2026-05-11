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
exports.getVerifiedExpertsByServiceTypeName = exports.changeBookingExpert = exports.deleteBooking = exports.updateBookingStatus = exports.getAdminBookingFilters = exports.getAdminBookings = void 0;
const sequelize_1 = require("sequelize");
const db_1 = __importDefault(require("../configs/db"));
const models_1 = require("../models");
const apiError_util_1 = require("../utils/apiError.util");
const messages_1 = require("../constants/messages");
const transaction_enum_1 = require("../enums/transaction.enum");
const adminBookingManagement_util_1 = require("../utils/adminBookingManagement.util");
const serviceProvider_logger_1 = require("./logger/serviceProvider.logger");
const enums_1 = require("../enums");
const servicePartner_enum_1 = require("../enums/servicePartner.enum");
const adminBookingManagement_repository_1 = require("../repositories/adminBookingManagement.repository");
const booking_logger_1 = require("./logger/booking.logger");
const paymentBookingStatusForBooking = (bookingStatus) => bookingStatus;
/**
 * @name getAdminBookings
 * @description Builds a grouped/paginated admin booking list with filtering, sorting, and aggregated booking counts/amounts.
 * @access Private
 */
const getAdminBookings = (query) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0, _1, _2, _3, _4, _5, _6, _7, _8, _9, _10, _11, _12, _13, _14;
    const page = (_a = (0, adminBookingManagement_util_1.parseNumber)(query.page)) !== null && _a !== void 0 ? _a : 1;
    const limit = (_b = (0, adminBookingManagement_util_1.parseNumber)(query.limit)) !== null && _b !== void 0 ? _b : 10;
    const offset = (page - 1) * limit;
    const q = String((_c = query.q) !== null && _c !== void 0 ? _c : "").trim();
    const serviceType = String((_f = (_e = (_d = query.serviceType) !== null && _d !== void 0 ? _d : query.service_type) !== null && _e !== void 0 ? _e : query.serviceTypeName) !== null && _f !== void 0 ? _f : "").trim();
    const date = String((_g = query.date) !== null && _g !== void 0 ? _g : "").trim(); // yyyy-MM-dd
    const time = String((_h = query.time) !== null && _h !== void 0 ? _h : "").trim(); // HH:mm
    const paymentMethodInput = String((_j = query.paymentMethod) !== null && _j !== void 0 ? _j : "").trim();
    const paymentMethod = paymentMethodInput
        ? (0, adminBookingManagement_util_1.mapPaymentMethodFromLabel)(paymentMethodInput)
        : undefined;
    const statusFilter = (0, adminBookingManagement_util_1.normalizeGroupStatusInput)(query.status);
    const bookedMin = (_k = (0, adminBookingManagement_util_1.parseNumber)(query.bookedMin)) !== null && _k !== void 0 ? _k : undefined;
    const bookedMax = (_l = (0, adminBookingManagement_util_1.parseNumber)(query.bookedMax)) !== null && _l !== void 0 ? _l : undefined;
    const amountMin = (_m = (0, adminBookingManagement_util_1.parseNumber)(query.amountMin)) !== null && _m !== void 0 ? _m : undefined;
    const amountMax = (_o = (0, adminBookingManagement_util_1.parseNumber)(query.amountMax)) !== null && _o !== void 0 ? _o : undefined;
    const sortByRaw = String((_p = query.sortBy) !== null && _p !== void 0 ? _p : "last_created_at").trim();
    const sortOrder = String((_q = query.sortOrder) !== null && _q !== void 0 ? _q : "DESC").toUpperCase();
    const sortOrderSafe = sortOrder === "ASC" ? "ASC" : "DESC";
    const allowedSortBy = new Set([
        "last_booking_date",
        "last_created_at",
        "total_amount",
        "total_bookings",
        "customer_name",
    ]);
    const sortBy = allowedSortBy.has(sortByRaw) ? sortByRaw : "last_created_at";
    const hasDate = Boolean(date);
    const hasTime = Boolean(time);
    if (hasTime && !hasDate) {
        throw new apiError_util_1.ApiError(enums_1.STATUS_CODE.BAD_REQUEST, messages_1.MESSAGES.COMMON.TIME_ONLY_WITH_DATE);
    }
    if (hasDate && !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        throw new apiError_util_1.ApiError(enums_1.STATUS_CODE.BAD_REQUEST, messages_1.MESSAGES.COMMON.INVALID_DATE_FORMAT);
    }
    if (hasTime && !/^(\d{1,2}):(\d{2})$/.test(time)) {
        throw new apiError_util_1.ApiError(enums_1.STATUS_CODE.BAD_REQUEST, messages_1.MESSAGES.COMMON.INVALID_TIME_FORMAT);
    }
    const bookingWhere = {};
    if (hasDate) {
        const [year, month, day] = date.split("-").map(Number);
        const endDate = new Date(year, month - 1, day + 1, 0, 0, 0, 0);
        if (hasTime) {
            const [hours, minutes] = time.split(":").map(Number);
            bookingWhere.bookingDate = {
                [sequelize_1.Op.gte]: new Date(year, month - 1, day, hours, minutes, 0, 0),
                [sequelize_1.Op.lt]: endDate,
            };
        }
        else {
            const startDate = new Date(year, month - 1, day, 0, 0, 0, 0);
            bookingWhere.bookingDate = { [sequelize_1.Op.gte]: startDate, [sequelize_1.Op.lt]: endDate };
        }
    }
    const customerWhere = q
        ? {
            [sequelize_1.Op.or]: [
                { name: { [sequelize_1.Op.iLike]: `%${q}%` } },
                { email: { [sequelize_1.Op.iLike]: `%${q}%` } },
                { mobileNumber: { [sequelize_1.Op.iLike]: `%${q}%` } },
            ],
        }
        : undefined;
    const includeForGroups = [
        {
            model: models_1.User,
            as: "customer",
            attributes: [],
            required: true,
            where: customerWhere,
        },
        {
            model: models_1.Payment,
            as: "payment",
            attributes: [],
            required: Boolean(paymentMethod),
            where: paymentMethod ? { paymentMethod } : undefined,
        },
        {
            model: models_1.ServiceType,
            as: "serviceType",
            attributes: [],
            required: Boolean(serviceType),
            where: serviceType ? { name: { [sequelize_1.Op.iLike]: serviceType } } : undefined,
        },
    ];
    const groupDateExpr = db_1.default.fn("DATE", db_1.default.col("Booking.booking_date"));
    const totalBookingsExpr = db_1.default.fn("COUNT", db_1.default.col("Booking.id"));
    const totalAmountExpr = db_1.default.fn("COALESCE", db_1.default.fn("SUM", db_1.default.col("Booking.amount")), 0);
    const lastBookingDateExpr = db_1.default.fn("MAX", db_1.default.col("Booking.booking_date"));
    const enumType = `"enum_bookings_status"`;
    const cancelledCountExpr = db_1.default.fn("SUM", db_1.default.literal(`CASE WHEN "Booking"."status" = '${transaction_enum_1.BookingStatus.CANCELLED}'::${enumType} THEN 1 ELSE 0 END`));
    const completedCountExpr = db_1.default.fn("SUM", db_1.default.literal(`CASE WHEN "Booking"."status" = '${transaction_enum_1.BookingStatus.COMPLETED}'::${enumType} THEN 1 ELSE 0 END`));
    const pendingCountExpr = db_1.default.fn("SUM", db_1.default.literal(`CASE WHEN "Booking"."status" = '${transaction_enum_1.BookingStatus.PENDING}'::${enumType} THEN 1 ELSE 0 END`));
    const lastCreatedAtExpr = db_1.default.fn("MAX", db_1.default.col("Booking.created_at"));
    const groupBy = [
        db_1.default.col("customer.id"),
        db_1.default.col("customer.name"),
        db_1.default.col("customer.email"),
        db_1.default.col("customer.mobile_number"),
        db_1.default.col("Booking.service_address"),
        groupDateExpr,
    ];
    const having = [];
    if (typeof bookedMin === "number")
        having.push(db_1.default.where(totalBookingsExpr, sequelize_1.Op.gte, bookedMin));
    if (typeof bookedMax === "number")
        having.push(db_1.default.where(totalBookingsExpr, sequelize_1.Op.lte, bookedMax));
    if (typeof amountMin === "number")
        having.push(db_1.default.where(totalAmountExpr, sequelize_1.Op.gte, amountMin));
    if (typeof amountMax === "number")
        having.push(db_1.default.where(totalAmountExpr, sequelize_1.Op.lte, amountMax));
    if (statusFilter === "Cancelled") {
        having.push(db_1.default.where(cancelledCountExpr, sequelize_1.Op.eq, totalBookingsExpr));
    }
    else if (statusFilter === "Completed") {
        having.push(db_1.default.where(completedCountExpr, sequelize_1.Op.eq, totalBookingsExpr));
    }
    else if (statusFilter === "Pending") {
        having.push(db_1.default.where(pendingCountExpr, sequelize_1.Op.eq, totalBookingsExpr));
    }
    else if (statusFilter === "In Progress") {
        having.push(db_1.default.where(cancelledCountExpr, sequelize_1.Op.lt, totalBookingsExpr));
        having.push(db_1.default.where(completedCountExpr, sequelize_1.Op.lt, totalBookingsExpr));
        having.push(db_1.default.where(pendingCountExpr, sequelize_1.Op.lt, totalBookingsExpr));
    }
    const orderExpr = sortBy === "customer_name"
        ? db_1.default.col("customer.name")
        : sortBy === "total_amount"
            ? totalAmountExpr
            : sortBy === "total_bookings"
                ? totalBookingsExpr
                : sortBy === "last_created_at"
                    ? lastCreatedAtExpr
                    : lastBookingDateExpr;
    const groupedRows = (yield adminBookingManagement_repository_1.adminBookingManagementRepository.getGroupedBookings({
        where: bookingWhere,
        include: includeForGroups,
        groupBy,
        having: having.length
            ? { [sequelize_1.Op.and]: having }
            : undefined,
        orderExpr,
        sortOrder: sortOrderSafe,
        limit,
        offset,
        attributes: [
            [db_1.default.col("customer.id"), "customer_id"],
            [db_1.default.col("customer.name"), "customer_name"],
            [db_1.default.col("customer.email"), "email"],
            [db_1.default.col("customer.mobile_number"), "phone"],
            [db_1.default.col("Booking.service_address"), "address"],
            [groupDateExpr, "group_date"],
            [
                db_1.default.fn("MIN", db_1.default.col("payment.payment_method")),
                "payment_method",
            ],
            [totalBookingsExpr, "total_bookings"],
            [totalAmountExpr, "total_amount"],
            [lastBookingDateExpr, "last_booking_date"],
            [lastCreatedAtExpr, "last_created_at"],
        ],
    }));
    const totalItems = yield adminBookingManagement_repository_1.adminBookingManagementRepository.countGroupedBookings({
        where: bookingWhere,
        include: includeForGroups,
        groupBy,
        having: having.length
            ? { [sequelize_1.Op.and]: having }
            : undefined,
    });
    if (groupedRows.length === 0) {
        return {
            rows: [],
            pagination: {
                totalItems: Number(totalItems) || 0,
                currentPage: page,
                limit,
                totalPages: 0,
            },
        };
    }
    const groupOr = groupedRows.map((r) => {
        var _a;
        return ({
            userId: Number(r.customer_id),
            serviceAddress: String((_a = r.address) !== null && _a !== void 0 ? _a : ""),
            [sequelize_1.Op.and]: [
                db_1.default.where(db_1.default.fn("DATE", db_1.default.col("Booking.booking_date")), sequelize_1.Op.eq, String(r.group_date).slice(0, 10)),
            ],
        });
    });
    const details = (yield adminBookingManagement_repository_1.adminBookingManagementRepository.getBookingDetails(groupOr, serviceType, paymentMethod));
    const byGroup = {};
    for (const r of groupedRows) {
        const customerId = String(r.customer_id);
        const groupDate = r.group_date ? String(r.group_date).slice(0, 10) : "";
        const address = String((_r = r.address) !== null && _r !== void 0 ? _r : "");
        const key = `${customerId}::${groupDate}::${address}`;
        const lastBookingDate = r.last_booking_date
            ? (0, adminBookingManagement_util_1.formatDateShort)(new Date(String(r.last_booking_date)))
            : "";
        const totalAmountNum = Number(r.total_amount) || 0;
        byGroup[key] = {
            id: key,
            customerName: String((_s = r.customer_name) !== null && _s !== void 0 ? _s : ""),
            phone: String((_t = r.phone) !== null && _t !== void 0 ? _t : ""),
            email: String((_u = r.email) !== null && _u !== void 0 ? _u : ""),
            totalBookings: Number((_v = r.total_bookings) !== null && _v !== void 0 ? _v : 0),
            address,
            lastBookingDate,
            totalAmount: (0, adminBookingManagement_util_1.formatMoneyUsdLike)(totalAmountNum),
            paymentMethod: (0, adminBookingManagement_util_1.mapPaymentMethodToLabel)(String((_w = r.payment_method) !== null && _w !== void 0 ? _w : "")),
            status: "Pending",
            details: [],
        };
    }
    for (const d of details) {
        const customerId = String(d.userId);
        const groupDate = d.group_date ? String(d.group_date).slice(0, 10) : "";
        const address = String((_x = d.serviceAddress) !== null && _x !== void 0 ? _x : "");
        const key = `${customerId}::${groupDate}::${address}`;
        if (!byGroup[key])
            continue;
        const bookingDate = d.bookingDate
            ? new Date(String(d.bookingDate))
            : undefined;
        const detail = {
            bookingId: String(d.id),
            serviceId: String(d.serviceId),
            service: String((_z = (_y = d.service) === null || _y === void 0 ? void 0 : _y.name) !== null && _z !== void 0 ? _z : ""),
            serviceType: String((_1 = (_0 = d.serviceType) === null || _0 === void 0 ? void 0 : _0.name) !== null && _1 !== void 0 ? _1 : ""),
            dateTime: bookingDate
                ? (0, adminBookingManagement_util_1.formatDateTimeDetail)(bookingDate, { includeYear: true })
                : "",
            assignedExpert: String((_4 = (_3 = (_2 = d.servicePartner) === null || _2 === void 0 ? void 0 : _2.user) === null || _3 === void 0 ? void 0 : _3.name) !== null && _4 !== void 0 ? _4 : "Unknown"),
            assignedExpertMobileNumber: String((_7 = (_6 = (_5 = d.servicePartner) === null || _5 === void 0 ? void 0 : _5.user) === null || _6 === void 0 ? void 0 : _6.mobileNumber) !== null && _7 !== void 0 ? _7 : ""),
            assignedExpertId: d.servicePartnerId !== null && d.servicePartnerId !== undefined
                ? Number(d.servicePartnerId)
                : undefined,
            assignedExpertAvatar: ((_9 = (_8 = d.servicePartner) === null || _8 === void 0 ? void 0 : _8.user) === null || _9 === void 0 ? void 0 : _9.profileImage) !== null &&
                ((_11 = (_10 = d.servicePartner) === null || _10 === void 0 ? void 0 : _10.user) === null || _11 === void 0 ? void 0 : _11.profileImage) !== undefined
                ? String((_13 = (_12 = d.servicePartner) === null || _12 === void 0 ? void 0 : _12.user) === null || _13 === void 0 ? void 0 : _13.profileImage)
                : undefined,
            status: (0, adminBookingManagement_util_1.toDetailStatus)(String((_14 = d.status) !== null && _14 !== void 0 ? _14 : transaction_enum_1.BookingStatus.PENDING)),
            cancellationReason: d.cancellation_reason !== null && d.cancellation_reason !== undefined
                ? String(d.cancellation_reason)
                : undefined,
        };
        byGroup[key].details.push(detail);
    }
    for (const group of Object.values(byGroup)) {
        group.status = (0, adminBookingManagement_util_1.computeRowStatus)(group.details);
        group.totalBookings = group.details.length;
    }
    const finalRows = groupedRows.map((r) => {
        var _a;
        const customerId = String(r.customer_id);
        const groupDate = r.group_date ? String(r.group_date).slice(0, 10) : "";
        const address = String((_a = r.address) !== null && _a !== void 0 ? _a : "");
        const key = `${customerId}::${groupDate}::${address}`;
        return byGroup[key];
    });
    const totalPages = limit > 0 ? Math.ceil(Number(totalItems) / limit) : 0;
    return {
        rows: finalRows,
        pagination: {
            totalItems: Number(totalItems),
            currentPage: page,
            limit,
            totalPages,
        },
    };
});
exports.getAdminBookings = getAdminBookings;
/**
 * @name getAdminBookingFilters
 * @description Returns filter options used by admin booking screens (service types, payment methods, booking statuses).
 * @access Private
 */
const getAdminBookingFilters = () => __awaiter(void 0, void 0, void 0, function* () {
    const serviceTypes = yield adminBookingManagement_repository_1.adminBookingManagementRepository.getServiceTypes();
    return {
        serviceTypes: serviceTypes
            .map((entry) => String(entry.name))
            .filter(Boolean),
        paymentMethods: Object.values(transaction_enum_1.PaymentMethod),
        bookingStatuses: Object.values(transaction_enum_1.BookingStatus),
    };
});
exports.getAdminBookingFilters = getAdminBookingFilters;
/**
 * @name updateBookingStatus
 * @description Validates and updates booking status (only for pending bookings); syncs the related payment record when present.
 * @access Private
 */
const updateBookingStatus = (bookingId, userId, status, cancellationReason) => __awaiter(void 0, void 0, void 0, function* () {
    if (!Number.isFinite(bookingId) || bookingId <= 0) {
        throw new apiError_util_1.ApiError(enums_1.STATUS_CODE.BAD_REQUEST, messages_1.MESSAGES.BOOKING.INVALID_ID);
    }
    const mapped = (0, adminBookingManagement_util_1.normalizeStatusInput)(status);
    const reason = typeof cancellationReason === "string"
        ? cancellationReason.trim()
        : undefined;
    const booking = yield adminBookingManagement_repository_1.adminBookingManagementRepository.findBookingById(bookingId);
    if (!booking)
        throw new apiError_util_1.ApiError(enums_1.STATUS_CODE.NOT_FOUND, messages_1.MESSAGES.BOOKING.NOT_FOUND);
    const currentStatus = booking.status;
    // Only allow changes for pending bookings (PENDING/CONFIRMED), not completed/cancelled.
    if (![transaction_enum_1.BookingStatus.PENDING, transaction_enum_1.BookingStatus.CONFIRMED].includes(currentStatus)) {
        throw new apiError_util_1.ApiError(enums_1.STATUS_CODE.BAD_REQUEST, messages_1.MESSAGES.BOOKING.ONLY_PENDING_CAN_BE_UPDATED);
    }
    const nextStatus = mapped;
    yield adminBookingManagement_repository_1.adminBookingManagementRepository.updateBooking(booking, Object.assign({ status: nextStatus }, (nextStatus === transaction_enum_1.BookingStatus.CANCELLED
        ? { cancellationReason: reason !== null && reason !== void 0 ? reason : null }
        : {})));
    yield (0, booking_logger_1.logBookingStatusChanged)({
        bookingId: booking.id,
        userId: userId,
        serviceId: booking.serviceId,
        oldStatus: currentStatus,
        newStatus: nextStatus,
    });
    const payment = booking.payment;
    if (payment) {
        const isCOD = payment.paymentMethod === transaction_enum_1.PaymentMethod.CASH;
        const isOnline = !isCOD;
        let paymentUpdate = {
            bookingStatus: nextStatus,
        };
        // ================= COMPLETED =================
        if (nextStatus === transaction_enum_1.BookingStatus.COMPLETED) {
            if (isCOD) {
                paymentUpdate.paymentStatus = transaction_enum_1.PaymentStatus.PAID;
                paymentUpdate.paidAt = new Date();
            }
        }
        // ================= CANCELLED =================
        if (nextStatus === transaction_enum_1.BookingStatus.CANCELLED) {
            if (isOnline && payment.paymentStatus === transaction_enum_1.PaymentStatus.PAID) {
                paymentUpdate.paymentStatus = transaction_enum_1.PaymentStatus.REFUNDED;
            }
        }
        yield adminBookingManagement_repository_1.adminBookingManagementRepository.updatePayment({ id: booking.paymentId }, paymentUpdate);
    }
    return { bookingId, status: nextStatus };
});
exports.updateBookingStatus = updateBookingStatus;
/**
 * @name deleteBooking
 * @description Deletes a booking record by id.
 * @access Private
 */
const deleteBooking = (bookingId) => __awaiter(void 0, void 0, void 0, function* () {
    if (!Number.isFinite(bookingId) || bookingId <= 0) {
        throw new apiError_util_1.ApiError(enums_1.STATUS_CODE.BAD_REQUEST, messages_1.MESSAGES.BOOKING.INVALID_ID);
    }
    const booking = yield adminBookingManagement_repository_1.adminBookingManagementRepository.findBookingById(bookingId);
    if (!booking)
        throw new apiError_util_1.ApiError(enums_1.STATUS_CODE.NOT_FOUND, messages_1.MESSAGES.BOOKING.NOT_FOUND);
    yield adminBookingManagement_repository_1.adminBookingManagementRepository.deleteBooking(bookingId);
});
exports.deleteBooking = deleteBooking;
/**
 * @name changeBookingExpert
 * @description Reassigns a booking to a different expert; validates status and service-type match and logs the change.
 * @access Private
 */
const changeBookingExpert = (bookingId, servicePartnerId, userId) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f, _g, _h;
    if (!Number.isFinite(bookingId) || bookingId <= 0) {
        throw new apiError_util_1.ApiError(enums_1.STATUS_CODE.BAD_REQUEST, messages_1.MESSAGES.BOOKING.INVALID_ID);
    }
    if (!Number.isFinite(servicePartnerId) || servicePartnerId <= 0) {
        throw new apiError_util_1.ApiError(enums_1.STATUS_CODE.BAD_REQUEST, messages_1.MESSAGES.EXPERT.INVALID_SERVICE_PARTNER_ID);
    }
    const booking = yield adminBookingManagement_repository_1.adminBookingManagementRepository.findBookingById(bookingId);
    if (!booking)
        throw new apiError_util_1.ApiError(enums_1.STATUS_CODE.NOT_FOUND, messages_1.MESSAGES.BOOKING.NOT_FOUND);
    const currentStatus = booking.status;
    // Only allow reassignment while booking is pending (PENDING/CONFIRMED).
    if (![transaction_enum_1.BookingStatus.PENDING, transaction_enum_1.BookingStatus.CONFIRMED].includes(currentStatus)) {
        throw new apiError_util_1.ApiError(enums_1.STATUS_CODE.BAD_REQUEST, messages_1.MESSAGES.BOOKING.ONLY_PENDING_CAN_CHANGE_EXPERT);
    }
    const [newExpert, oldExpert] = yield Promise.all([
        adminBookingManagement_repository_1.adminBookingManagementRepository.findServicePartnerWithUser(servicePartnerId),
        booking.servicePartnerId
            ? adminBookingManagement_repository_1.adminBookingManagementRepository.findServicePartnerWithUser(booking.servicePartnerId)
            : null,
    ]);
    if (!newExpert)
        throw new apiError_util_1.ApiError(enums_1.STATUS_CODE.NOT_FOUND, messages_1.MESSAGES.EXPERT.NOT_FOUND);
    const newExpertEmail = (_b = (_a = newExpert === null || newExpert === void 0 ? void 0 : newExpert.user) === null || _a === void 0 ? void 0 : _a.email) !== null && _b !== void 0 ? _b : "";
    const oldExpertEmail = (_d = (_c = oldExpert === null || oldExpert === void 0 ? void 0 : oldExpert.user) === null || _c === void 0 ? void 0 : _c.email) !== null && _d !== void 0 ? _d : "";
    // Validate that the expert belongs to the same service type as the booked service.
    // ServicePartner.serviceTypeId is used as the mapping source.
    let serviceTypeId = booking.serviceTypeId;
    if (!serviceTypeId) {
        const service = yield adminBookingManagement_repository_1.adminBookingManagementRepository.findServiceByIdWithRelations(booking.serviceId);
        if (!service)
            throw new apiError_util_1.ApiError(enums_1.STATUS_CODE.NOT_FOUND, messages_1.MESSAGES.SERVICE.NOT_FOUND);
        const subCategory = service.get("subCategory");
        const category = (_e = subCategory === null || subCategory === void 0 ? void 0 : subCategory.get) === null || _e === void 0 ? void 0 : _e.call(subCategory, "category");
        const includedServiceType = (_f = category === null || category === void 0 ? void 0 : category.get) === null || _f === void 0 ? void 0 : _f.call(category, "serviceType");
        serviceTypeId =
            typeof (includedServiceType === null || includedServiceType === void 0 ? void 0 : includedServiceType.id) === "number"
                ? includedServiceType.id
                : null;
        // Fallback for legacy/inconsistent data where sub_category_id join is missing.
        if (!serviceTypeId) {
            const categoryId = (_g = subCategory === null || subCategory === void 0 ? void 0 : subCategory.categoryId) !== null && _g !== void 0 ? _g : service.categoryId;
            if (categoryId) {
                const category = yield adminBookingManagement_repository_1.adminBookingManagementRepository.findCategoryWithServiceType(categoryId);
                const serviceType = (_h = category === null || category === void 0 ? void 0 : category.get) === null || _h === void 0 ? void 0 : _h.call(category, "serviceType");
                serviceTypeId =
                    typeof (serviceType === null || serviceType === void 0 ? void 0 : serviceType.id) === "number" ? serviceType.id : null;
            }
        }
        if (serviceTypeId) {
            yield adminBookingManagement_repository_1.adminBookingManagementRepository.updateBooking(booking, {
                serviceTypeId: Number(serviceTypeId),
            });
        }
    }
    if (!serviceTypeId)
        throw new apiError_util_1.ApiError(enums_1.STATUS_CODE.BAD_REQUEST, messages_1.MESSAGES.BOOKING.CANNOT_RESOLVE_SERVICE_TYPE);
    if (Number(newExpert.serviceTypeIds) !== Number(serviceTypeId)) {
        throw new apiError_util_1.ApiError(enums_1.STATUS_CODE.BAD_REQUEST, messages_1.MESSAGES.BOOKING.EXPERT_SERVICE_TYPE_MISMATCH);
    }
    yield adminBookingManagement_repository_1.adminBookingManagementRepository.updateBooking(booking, {
        servicePartnerId,
    });
    const message = `Booking expert changed from ${oldExpertEmail || "previous expert"} to ${newExpertEmail || "new expert"} for booking id ${bookingId || "N/A"}`;
    yield (0, serviceProvider_logger_1.logServiceProviderChanged)({
        bookingId,
        serviceId: booking.serviceId,
        userId: userId,
        message,
    });
    if (booking.paymentId) {
        yield adminBookingManagement_repository_1.adminBookingManagementRepository.updatePayment({ id: booking.paymentId }, { servicePartnerId });
    }
});
exports.changeBookingExpert = changeBookingExpert;
/**
 * @name getVerifiedExpertsByServiceTypeName
 * @description Returns verified/active experts for a given service type name (used by admin reassignment flow).
 * @access Private
 */
const getVerifiedExpertsByServiceTypeName = (serviceTypeName) => __awaiter(void 0, void 0, void 0, function* () {
    if (!serviceTypeName)
        return [];
    const serviceType = yield adminBookingManagement_repository_1.adminBookingManagementRepository.findServiceTypeByName(serviceTypeName);
    if (!serviceType)
        return [];
    const experts = yield adminBookingManagement_repository_1.adminBookingManagementRepository.findExpertsByServiceType(serviceType.id, servicePartner_enum_1.VerificationStatus.VERIFIED, servicePartner_enum_1.ServicePartnerStatus.ACTIVE);
    return experts.map((p) => {
        var _a, _b, _c, _d, _e, _f;
        return ({
            id: p.id,
            name: (_b = (_a = p.user) === null || _a === void 0 ? void 0 : _a.name) !== null && _b !== void 0 ? _b : "Unknown",
            avatar: (_d = (_c = p.user) === null || _c === void 0 ? void 0 : _c.profileImage) !== null && _d !== void 0 ? _d : undefined,
            verified: String((_e = p.verificationStatus) !== null && _e !== void 0 ? _e : "") === servicePartner_enum_1.VerificationStatus.VERIFIED &&
                String((_f = p.status) !== null && _f !== void 0 ? _f : "") === servicePartner_enum_1.ServicePartnerStatus.ACTIVE,
        });
    });
});
exports.getVerifiedExpertsByServiceTypeName = getVerifiedExpertsByServiceTypeName;
