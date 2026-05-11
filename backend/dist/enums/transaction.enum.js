"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MyBookingTab = exports.BookingStatus = exports.PaymentStatus = exports.PaymentGateway = exports.PaymentMethod = void 0;
var PaymentMethod;
(function (PaymentMethod) {
    PaymentMethod["CASH"] = "CASH";
    PaymentMethod["CARD"] = "CARD";
})(PaymentMethod || (exports.PaymentMethod = PaymentMethod = {}));
var PaymentGateway;
(function (PaymentGateway) {
    PaymentGateway["STRIPE"] = "STRIPE";
    PaymentGateway["RAZORPAY"] = "RAZORPAY";
})(PaymentGateway || (exports.PaymentGateway = PaymentGateway = {}));
var PaymentStatus;
(function (PaymentStatus) {
    PaymentStatus["PENDING"] = "PENDING";
    PaymentStatus["PAID"] = "PAID";
    PaymentStatus["FAILED"] = "FAILED";
    PaymentStatus["REFUNDED"] = "REFUNDED";
})(PaymentStatus || (exports.PaymentStatus = PaymentStatus = {}));
var BookingStatus;
(function (BookingStatus) {
    BookingStatus["PENDING"] = "PENDING";
    BookingStatus["CONFIRMED"] = "CONFIRMED";
    BookingStatus["CANCELLED"] = "CANCELLED";
    BookingStatus["COMPLETED"] = "COMPLETED";
})(BookingStatus || (exports.BookingStatus = BookingStatus = {}));
var MyBookingTab;
(function (MyBookingTab) {
    MyBookingTab["UPCOMING"] = "UPCOMING";
    MyBookingTab["COMPLETED"] = "COMPLETED";
})(MyBookingTab || (exports.MyBookingTab = MyBookingTab = {}));
