"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const serviceType_routes_1 = __importDefault(require("./serviceType.routes"));
const category_routes_1 = __importDefault(require("./category.routes"));
const subCategory_routes_1 = __importDefault(require("./subCategory.routes"));
const serviceAdmin_routes_1 = __importDefault(require("./serviceAdmin.routes"));
const contact_routes_1 = __importDefault(require("./contact.routes"));
const servicePartner_routes_1 = __importDefault(require("./servicePartner.routes"));
const home_routes_1 = __importDefault(require("./home.routes"));
const adminUser_routes_1 = __importDefault(require("./adminUser.routes"));
const transaction_routes_1 = __importDefault(require("./transaction.routes"));
const configuration_routes_1 = __importDefault(require("./configuration.routes"));
const couponUsage_routes_1 = __importDefault(require("./couponUsage.routes"));
const adminCustomer_routes_1 = __importDefault(require("./adminCustomer.routes"));
const serviceBookingCheckout_routes_1 = __importDefault(require("./serviceBookingCheckout.routes"));
const adminBookingManagement_routes_1 = __importDefault(require("./adminBookingManagement.routes"));
const dashboard_routes_1 = __importDefault(require("./dashboard.routes"));
const booking_routes_1 = __importDefault(require("./booking.routes"));
const customerAuth_routes_1 = __importDefault(require("./customerAuth.routes"));
const auth_routes_1 = __importDefault(require("./auth.routes"));
const logger_routes_1 = __importDefault(require("./logger.routes"));
const role_routes_1 = __importDefault(require("./role.routes"));
const offer_routes_1 = __importDefault(require("./offer.routes"));
const router = (0, express_1.Router)();
/**
 * Main API routes
 * Base path: /api
 */
router.use("/auth", auth_routes_1.default);
router.use("/service-types", serviceType_routes_1.default);
router.use("/admin-users", adminUser_routes_1.default);
router.use("/transactions", transaction_routes_1.default);
router.use("/admin-customers", adminCustomer_routes_1.default);
router.use("/home", home_routes_1.default);
router.use("/configurations", configuration_routes_1.default);
router.use("/coupon-usages", couponUsage_routes_1.default);
router.use("/dashboard", dashboard_routes_1.default);
router.use("/offers", offer_routes_1.default);
router.use("/", category_routes_1.default);
router.use("/", subCategory_routes_1.default);
router.use("/", serviceAdmin_routes_1.default);
router.use("/contacts", contact_routes_1.default);
router.use("/service-partners", servicePartner_routes_1.default);
router.use("/service-bookings", serviceBookingCheckout_routes_1.default);
router.use("/admin-bookings", adminBookingManagement_routes_1.default);
router.use("/bookings", booking_routes_1.default);
router.use("/log", logger_routes_1.default);
router.use("/roles", role_routes_1.default);
// ── Customer-facing auth routes ──────────────────────────────────────────────
router.use("/v1/customer", customerAuth_routes_1.default);
exports.default = router;
