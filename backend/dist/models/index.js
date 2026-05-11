"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Role = exports.Log = exports.CustomerOtp = exports.Payment = exports.Address = exports.Offer = exports.CouponUsage = exports.Configuration = exports.Booking = exports.Admin = exports.User = exports.ServicePartnerDocument = exports.ServicePartnerLanguage = exports.ServicePartnerService = exports.ServicePartnerSkill = exports.ServicePartnerExperience = exports.ServicePartnerEducation = exports.ServicePartner = exports.Contact = exports.Service = exports.SubCategory = exports.Category = exports.ServiceType = void 0;
const serviceType_model_1 = require("./serviceType.model");
Object.defineProperty(exports, "ServiceType", { enumerable: true, get: function () { return serviceType_model_1.ServiceType; } });
const category_model_1 = require("./category.model");
Object.defineProperty(exports, "Category", { enumerable: true, get: function () { return category_model_1.Category; } });
const subCategory_model_1 = require("./subCategory.model");
Object.defineProperty(exports, "SubCategory", { enumerable: true, get: function () { return subCategory_model_1.SubCategory; } });
const service_model_1 = require("./service.model");
Object.defineProperty(exports, "Service", { enumerable: true, get: function () { return service_model_1.Service; } });
const contact_model_1 = __importDefault(require("./contact.model"));
exports.Contact = contact_model_1.default;
const servicePartner_model_1 = require("./servicePartner.model");
Object.defineProperty(exports, "ServicePartner", { enumerable: true, get: function () { return servicePartner_model_1.ServicePartner; } });
const servicePartnerEducation_model_1 = require("./servicePartnerEducation.model");
Object.defineProperty(exports, "ServicePartnerEducation", { enumerable: true, get: function () { return servicePartnerEducation_model_1.ServicePartnerEducation; } });
const servicePartnerExperience_model_1 = require("./servicePartnerExperience.model");
Object.defineProperty(exports, "ServicePartnerExperience", { enumerable: true, get: function () { return servicePartnerExperience_model_1.ServicePartnerExperience; } });
const servicePartnerSkill_model_1 = require("./servicePartnerSkill.model");
Object.defineProperty(exports, "ServicePartnerSkill", { enumerable: true, get: function () { return servicePartnerSkill_model_1.ServicePartnerSkill; } });
const servicePartnerService_model_1 = require("./servicePartnerService.model");
Object.defineProperty(exports, "ServicePartnerService", { enumerable: true, get: function () { return servicePartnerService_model_1.ServicePartnerService; } });
const servicePartnerLanguage_model_1 = require("./servicePartnerLanguage.model");
Object.defineProperty(exports, "ServicePartnerLanguage", { enumerable: true, get: function () { return servicePartnerLanguage_model_1.ServicePartnerLanguage; } });
const servicePartnerDocument_model_1 = require("./servicePartnerDocument.model");
Object.defineProperty(exports, "ServicePartnerDocument", { enumerable: true, get: function () { return servicePartnerDocument_model_1.ServicePartnerDocument; } });
const user_model_1 = __importDefault(require("./user.model"));
exports.User = user_model_1.default;
const booking_model_1 = __importDefault(require("./booking.model"));
exports.Booking = booking_model_1.default;
const admin_model_1 = __importDefault(require("./admin.model"));
exports.Admin = admin_model_1.default;
const configuration_model_1 = __importDefault(require("./configuration.model"));
exports.Configuration = configuration_model_1.default;
const couponUsage_model_1 = __importDefault(require("./couponUsage.model"));
exports.CouponUsage = couponUsage_model_1.default;
const offer_model_1 = __importDefault(require("./offer.model"));
exports.Offer = offer_model_1.default;
const address_model_1 = __importDefault(require("./address.model"));
exports.Address = address_model_1.default;
const payment_model_1 = __importDefault(require("./payment.model"));
exports.Payment = payment_model_1.default;
const customerOtp_model_1 = __importDefault(require("./customerOtp.model"));
exports.CustomerOtp = customerOtp_model_1.default;
const log_model_1 = __importDefault(require("./log.model"));
exports.Log = log_model_1.default;
const role_model_1 = __importDefault(require("./role.model"));
exports.Role = role_model_1.default;
// One Service → Many Bookings
service_model_1.Service.hasMany(booking_model_1.default, { foreignKey: "service_id", as: "bookings" });
// One Booking → One Service
booking_model_1.default.belongsTo(service_model_1.Service, { foreignKey: "service_id", as: "service" });
// One ServiceType → Many Bookings
serviceType_model_1.ServiceType.hasMany(booking_model_1.default, { foreignKey: "service_type_id", as: "bookings" });
// One Booking → One ServiceType
booking_model_1.default.belongsTo(serviceType_model_1.ServiceType, { foreignKey: "service_type_id", as: "serviceType" });
// ServiceType has many Categories
serviceType_model_1.ServiceType.hasMany(category_model_1.Category, {
    foreignKey: "service_type_id",
    as: "categories",
});
category_model_1.Category.belongsTo(serviceType_model_1.ServiceType, {
    foreignKey: "service_type_id",
    as: "serviceType",
});
// Category has many SubCategories
category_model_1.Category.hasMany(subCategory_model_1.SubCategory, {
    foreignKey: "category_id",
    as: "subcategories",
});
subCategory_model_1.SubCategory.belongsTo(category_model_1.Category, { foreignKey: "category_id", as: "category" });
// SubCategory has many Services
subCategory_model_1.SubCategory.hasMany(service_model_1.Service, { foreignKey: "sub_category_id", as: "services" });
service_model_1.Service.belongsTo(subCategory_model_1.SubCategory, {
    foreignKey: "sub_category_id",
    as: "subCategory",
});
// ServicePartner Associations
servicePartner_model_1.ServicePartner.belongsTo(serviceType_model_1.ServiceType, {
    foreignKey: "service_type_id",
    as: "serviceType",
});
serviceType_model_1.ServiceType.hasMany(servicePartner_model_1.ServicePartner, {
    foreignKey: "service_type_id",
    as: "partners",
});
servicePartner_model_1.ServicePartner.hasMany(servicePartnerEducation_model_1.ServicePartnerEducation, {
    foreignKey: "partner_id",
    as: "educations",
    onDelete: "CASCADE",
});
servicePartnerEducation_model_1.ServicePartnerEducation.belongsTo(servicePartner_model_1.ServicePartner, { foreignKey: "partner_id" });
servicePartner_model_1.ServicePartner.hasMany(servicePartnerExperience_model_1.ServicePartnerExperience, {
    foreignKey: "partner_id",
    as: "experiences",
    onDelete: "CASCADE",
});
servicePartnerExperience_model_1.ServicePartnerExperience.belongsTo(servicePartner_model_1.ServicePartner, {
    foreignKey: "partner_id",
});
servicePartner_model_1.ServicePartner.hasMany(servicePartnerSkill_model_1.ServicePartnerSkill, {
    foreignKey: "partner_id",
    as: "skills",
    onDelete: "CASCADE",
});
servicePartnerSkill_model_1.ServicePartnerSkill.belongsTo(servicePartner_model_1.ServicePartner, { foreignKey: "partner_id" });
servicePartnerSkill_model_1.ServicePartnerSkill.belongsTo(category_model_1.Category, {
    foreignKey: "category_id",
    as: "category",
});
servicePartner_model_1.ServicePartner.hasMany(servicePartnerService_model_1.ServicePartnerService, {
    foreignKey: "partner_id",
    as: "services",
    onDelete: "CASCADE",
});
servicePartnerService_model_1.ServicePartnerService.belongsTo(servicePartner_model_1.ServicePartner, { foreignKey: "partner_id" });
servicePartnerService_model_1.ServicePartnerService.belongsTo(subCategory_model_1.SubCategory, {
    foreignKey: "sub_category_id",
    as: "subCategory",
});
servicePartner_model_1.ServicePartner.hasMany(servicePartnerLanguage_model_1.ServicePartnerLanguage, {
    foreignKey: "partner_id",
    as: "languages",
    onDelete: "CASCADE",
});
servicePartnerLanguage_model_1.ServicePartnerLanguage.belongsTo(servicePartner_model_1.ServicePartner, { foreignKey: "partner_id" });
servicePartner_model_1.ServicePartner.hasMany(servicePartnerDocument_model_1.ServicePartnerDocument, {
    foreignKey: "partner_id",
    as: "documents",
    onDelete: "CASCADE",
});
servicePartnerDocument_model_1.ServicePartnerDocument.belongsTo(servicePartner_model_1.ServicePartner, { foreignKey: "partner_id" });
booking_model_1.default.belongsTo(servicePartner_model_1.ServicePartner, {
    foreignKey: "service_partner_id",
    as: "servicePartner",
});
servicePartner_model_1.ServicePartner.hasMany(booking_model_1.default, {
    foreignKey: "service_partner_id",
    as: "bookings",
});
payment_model_1.default.hasOne(booking_model_1.default, { foreignKey: "payment_id", as: "booking" });
booking_model_1.default.belongsTo(payment_model_1.default, { foreignKey: "payment_id", as: "paymentDetails" });
// User Associations
user_model_1.default.belongsTo(role_model_1.default, { foreignKey: "roleId", as: "role" });
role_model_1.default.hasMany(user_model_1.default, { foreignKey: "roleId", as: "users" });
user_model_1.default.hasOne(servicePartner_model_1.ServicePartner, { foreignKey: "user_id", as: "servicePartner" });
servicePartner_model_1.ServicePartner.belongsTo(user_model_1.default, { foreignKey: "user_id", as: "user" });
// User → Many Bookings (Customer)
user_model_1.default.hasMany(booking_model_1.default, { foreignKey: "user_id", as: "bookings" });
booking_model_1.default.belongsTo(user_model_1.default, { foreignKey: "user_id", as: "customer" });
user_model_1.default.hasMany(address_model_1.default, { foreignKey: "user_id", as: "addresses" });
address_model_1.default.belongsTo(user_model_1.default, { foreignKey: "user_id", as: "user" });
// Offer and CouponUsage Associations
offer_model_1.default.hasMany(couponUsage_model_1.default, { foreignKey: "offerId", as: "usages" });
couponUsage_model_1.default.belongsTo(offer_model_1.default, { foreignKey: "offerId", as: "offer" });
// Offer and Payment Associations
payment_model_1.default.belongsTo(offer_model_1.default, { foreignKey: "coupon_id", as: "offer" });
offer_model_1.default.hasMany(payment_model_1.default, { foreignKey: "coupon_id", as: "payments" });
payment_model_1.default.hasOne(booking_model_1.default, { foreignKey: "payment_id", as: "bookings" });
booking_model_1.default.belongsTo(payment_model_1.default, { foreignKey: "payment_id", as: "payment" });
address_model_1.default.hasMany(payment_model_1.default, { foreignKey: "address_id", as: "payments" });
payment_model_1.default.belongsTo(address_model_1.default, { foreignKey: "address_id", as: "address" });
user_model_1.default.hasMany(payment_model_1.default, { foreignKey: "user_id", as: "payments" });
payment_model_1.default.belongsTo(user_model_1.default, { foreignKey: "user_id", as: "user" });
service_model_1.Service.hasMany(payment_model_1.default, { foreignKey: "service_id", as: "payments" });
payment_model_1.default.belongsTo(service_model_1.Service, { foreignKey: "service_id", as: "service" });
// Log Associations
user_model_1.default.hasMany(log_model_1.default, { foreignKey: "user_id", as: "logs" });
log_model_1.default.belongsTo(user_model_1.default, { foreignKey: "user_id", as: "user" });
service_model_1.Service.hasMany(log_model_1.default, { foreignKey: "service_id", as: "logs" });
log_model_1.default.belongsTo(service_model_1.Service, { foreignKey: "service_id", as: "service" });
booking_model_1.default.hasMany(log_model_1.default, { foreignKey: "booking_id", as: "logs" });
log_model_1.default.belongsTo(booking_model_1.default, { foreignKey: "booking_id", as: "booking" });
