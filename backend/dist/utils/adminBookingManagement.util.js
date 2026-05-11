"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mapBookingStatusToEnum = exports.normalizeStatusInput = exports.computeRowStatus = exports.toDetailStatus = exports.formatDateTimeDetail = exports.formatDateShort = exports.formatMoneyUsdLike = exports.parseNumber = exports.mapPaymentMethodFromLabel = exports.mapPaymentMethodToLabel = exports.normalizeGroupStatusInput = void 0;
const apiError_util_1 = require("../utils/apiError.util");
const transaction_enum_1 = require("../enums/transaction.enum");
const messages_1 = require("../constants/messages");
const enums_1 = require("../enums");
const BOOKING_ROW_STATUS = {
    PENDING: "Pending",
    IN_PROGRESS: "In Progress",
    COMPLETED: "Completed",
    CANCELLED: "Cancelled",
};
const BOOKING_DETAIL_STATUS = {
    PENDING: "Pending",
    CONFIRMED: "Confirmed",
    COMPLETED: "Completed",
    CANCELLED: "Cancelled",
};
const BOOKING_STATUS_INPUT_MAP = new Map([
    ["pending", transaction_enum_1.BookingStatus.PENDING],
    ["p", transaction_enum_1.BookingStatus.PENDING],
    ["confirmed", transaction_enum_1.BookingStatus.CONFIRMED],
    ["in progress", transaction_enum_1.BookingStatus.CONFIRMED],
    ["in-progress", transaction_enum_1.BookingStatus.CONFIRMED],
    ["in_progress", transaction_enum_1.BookingStatus.CONFIRMED],
    ["completed", transaction_enum_1.BookingStatus.COMPLETED],
    ["complete", transaction_enum_1.BookingStatus.COMPLETED],
    ["cancelled", transaction_enum_1.BookingStatus.CANCELLED],
    ["canceled", transaction_enum_1.BookingStatus.CANCELLED],
]);
const ROW_STATUS_BY_BOOKING_STATUS = {
    [transaction_enum_1.BookingStatus.PENDING]: BOOKING_ROW_STATUS.PENDING,
    [transaction_enum_1.BookingStatus.CONFIRMED]: BOOKING_ROW_STATUS.IN_PROGRESS,
    [transaction_enum_1.BookingStatus.COMPLETED]: BOOKING_ROW_STATUS.COMPLETED,
    [transaction_enum_1.BookingStatus.CANCELLED]: BOOKING_ROW_STATUS.CANCELLED,
};
const DETAIL_STATUS_BY_BOOKING_STATUS = {
    [transaction_enum_1.BookingStatus.PENDING]: BOOKING_DETAIL_STATUS.PENDING,
    [transaction_enum_1.BookingStatus.CONFIRMED]: BOOKING_DETAIL_STATUS.CONFIRMED,
    [transaction_enum_1.BookingStatus.COMPLETED]: BOOKING_DETAIL_STATUS.COMPLETED,
    [transaction_enum_1.BookingStatus.CANCELLED]: BOOKING_DETAIL_STATUS.CANCELLED,
};
const PAYMENT_METHOD_LABEL_BY_ENUM = {
    [transaction_enum_1.PaymentMethod.CASH]: "Cash",
    [transaction_enum_1.PaymentMethod.CARD]: "Card",
};
const PAYMENT_METHOD_INPUT_MAP = new Map([
    ["CASH", transaction_enum_1.PaymentMethod.CASH],
    ["C", transaction_enum_1.PaymentMethod.CASH],
    ["CARD", transaction_enum_1.PaymentMethod.CARD],
    ["DEBIT CARD", transaction_enum_1.PaymentMethod.CARD],
    ["CREDIT CARD", transaction_enum_1.PaymentMethod.CARD],
]);
const normalizeToken = (value) => String(value !== null && value !== void 0 ? value : "").trim();
const normalizeKey = (value) => value.trim().toLowerCase();
const normalizeEnumKey = (value) => value.trim().toUpperCase();
const parseBookingStatus = (value) => BOOKING_STATUS_INPUT_MAP.get(normalizeKey(value));
const normalizeGroupStatusInput = (status) => {
    const raw = normalizeToken(status);
    if (!raw)
        return undefined;
    const parsed = parseBookingStatus(raw);
    if (parsed)
        return ROW_STATUS_BY_BOOKING_STATUS[parsed];
    throw new apiError_util_1.ApiError(enums_1.STATUS_CODE.BAD_REQUEST, `Invalid booking status filter: ${raw}`);
};
exports.normalizeGroupStatusInput = normalizeGroupStatusInput;
const mapPaymentMethodToLabel = (value) => {
    if (!value)
        return "Unknown";
    const normalized = normalizeEnumKey(value);
    if (normalized === transaction_enum_1.PaymentMethod.CASH)
        return PAYMENT_METHOD_LABEL_BY_ENUM[transaction_enum_1.PaymentMethod.CASH];
    if (normalized === transaction_enum_1.PaymentMethod.CARD)
        return PAYMENT_METHOD_LABEL_BY_ENUM[transaction_enum_1.PaymentMethod.CARD];
    return value;
};
exports.mapPaymentMethodToLabel = mapPaymentMethodToLabel;
const mapPaymentMethodFromLabel = (value) => {
    if (!value)
        return undefined;
    return PAYMENT_METHOD_INPUT_MAP.get(normalizeEnumKey(value));
};
exports.mapPaymentMethodFromLabel = mapPaymentMethodFromLabel;
const parseNumber = (v) => {
    const n = typeof v === "string" ? Number(v) : Number(v);
    return Number.isFinite(n) ? n : undefined;
};
exports.parseNumber = parseNumber;
const formatMoneyUsdLike = (amount) => {
    const safe = Number.isFinite(amount) ? amount : 0;
    const fixed = safe.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
    return `$${fixed}`;
};
exports.formatMoneyUsdLike = formatMoneyUsdLike;
const formatDateShort = (date) => date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
});
exports.formatDateShort = formatDateShort;
const formatDateTimeDetail = (date, options = {}) => {
    const { includeYear = false, includeComma = true } = options;
    const datePart = date.toLocaleDateString("en-GB", Object.assign({ day: "2-digit", month: "short" }, (includeYear && { year: "numeric" })));
    const timePart = date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
    });
    return includeComma
        ? `${datePart}, ${timePart}`
        : `${datePart} ${timePart}`;
};
exports.formatDateTimeDetail = formatDateTimeDetail;
const toDetailStatus = (bookingStatus) => {
    const raw = normalizeToken(bookingStatus);
    const parsed = raw ? parseBookingStatus(raw) : undefined;
    return parsed
        ? DETAIL_STATUS_BY_BOOKING_STATUS[parsed]
        : BOOKING_DETAIL_STATUS.PENDING;
};
exports.toDetailStatus = toDetailStatus;
const computeRowStatus = (details) => {
    if (details.length === 0)
        return BOOKING_ROW_STATUS.CANCELLED;
    if (details.every((d) => d.status === BOOKING_DETAIL_STATUS.CANCELLED))
        return BOOKING_ROW_STATUS.CANCELLED;
    if (details.every((d) => d.status === BOOKING_DETAIL_STATUS.COMPLETED))
        return BOOKING_ROW_STATUS.COMPLETED;
    if (details.every((d) => d.status === BOOKING_DETAIL_STATUS.PENDING))
        return BOOKING_ROW_STATUS.PENDING;
    return BOOKING_ROW_STATUS.IN_PROGRESS;
};
exports.computeRowStatus = computeRowStatus;
const normalizeStatusInput = (status) => {
    const raw = normalizeToken(status);
    if (!raw)
        throw new apiError_util_1.ApiError(enums_1.STATUS_CODE.BAD_REQUEST, messages_1.MESSAGES.BOOKING.STATUS_IS_REQUIRED);
    const parsed = parseBookingStatus(raw);
    if (parsed)
        return parsed;
    throw new apiError_util_1.ApiError(enums_1.STATUS_CODE.BAD_REQUEST, `Invalid booking status: ${raw}`);
};
exports.normalizeStatusInput = normalizeStatusInput;
const mapBookingStatusToEnum = (value) => {
    if (!value)
        return null;
    const raw = normalizeToken(value);
    if (!raw)
        return null;
    const normalized = normalizeEnumKey(raw);
    if (Object.values(transaction_enum_1.BookingStatus).includes(normalized)) {
        return normalized;
    }
    return null;
};
exports.mapBookingStatusToEnum = mapBookingStatusToEnum;
