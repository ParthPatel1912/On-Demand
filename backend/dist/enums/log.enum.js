"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CurrencyValueSymbol = exports.CurrencySymbol = exports.LogStatus = exports.LogCategory = exports.LogEventType = void 0;
var LogEventType;
(function (LogEventType) {
    LogEventType["BOOK_SERVICE_CLICK"] = "BOOK_SERVICE_CLICK";
    LogEventType["BOOK_SERVICE_CONFIRM"] = "BOOK_SERVICE_CONFIRM";
    LogEventType["BOOKING_SERVICE_BLOCK"] = "BOOKING_SERVICE_BLOCK";
    LogEventType["PAYMENT_INITIATED"] = "PAYMENT_INITIATED";
    LogEventType["PAYMENT_SUCCESS"] = "PAYMENT_SUCCESS";
    LogEventType["PAYMENT_FAILED"] = "PAYMENT_FAILED";
    LogEventType["PAYMENT_REFUNDED"] = "PAYMENT_REFUNDED";
    LogEventType["PAYMENT_REFUNDED_FAILED"] = "PAYMENT_REFUNDED_FAILED";
    LogEventType["SERVICE_PROVIDER_CHANGED"] = "SERVICE_PROVIDER_CHANGED";
    LogEventType["SERVICE_PROVIDER_ASSIGNED"] = "SERVICE_PROVIDER_ASSIGNED";
    LogEventType["SERVICE_COMPLETED"] = "SERVICE_COMPLETED";
    LogEventType["SERVICE_STATUS_CHANGED"] = "SERVICE_STATUS_CHANGED";
    LogEventType["SERVICE_CANCELLED"] = "SERVICE_CANCELLED";
    LogEventType["BOOKING_STATUS_CHANGED"] = "BOOKING_STATUS_CHANGED";
})(LogEventType || (exports.LogEventType = LogEventType = {}));
var LogCategory;
(function (LogCategory) {
    LogCategory["PAYMENT"] = "PAYMENT";
    LogCategory["BOOKING"] = "BOOKING";
    LogCategory["SERVICE"] = "SERVICE";
    LogCategory["SERVICE_PROVIDER"] = "SERVICE_PROVIDER";
    LogCategory["CUSTOMER"] = "CUSTOMER";
})(LogCategory || (exports.LogCategory = LogCategory = {}));
var LogStatus;
(function (LogStatus) {
    LogStatus["INITIATED"] = "INITIATED";
    LogStatus["SUCCESS"] = "SUCCESS";
    LogStatus["FAILED"] = "FAILED";
})(LogStatus || (exports.LogStatus = LogStatus = {}));
var CurrencySymbol;
(function (CurrencySymbol) {
    CurrencySymbol["USD"] = "$";
    CurrencySymbol["INR"] = "\u20B9";
})(CurrencySymbol || (exports.CurrencySymbol = CurrencySymbol = {}));
var CurrencyValueSymbol;
(function (CurrencyValueSymbol) {
    CurrencyValueSymbol["USD"] = "USD";
    CurrencyValueSymbol["INR"] = "INR";
})(CurrencyValueSymbol || (exports.CurrencyValueSymbol = CurrencyValueSymbol = {}));
