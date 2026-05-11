"use strict";
/**
 * Centralized API messages — import from here everywhere.
 *
 * @example
 * import { MESSAGES } from "../../constants/messages";
 *
 * throw new ApiError(404, MESSAGES.BOOKING.NOT_FOUND);
 * return sendResponse(res, MESSAGES.AUTH.LOGIN_SUCCESS, data);
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.MESSAGES = void 0;
const auth_messages_1 = require("./auth.messages");
const user_messages_1 = require("./user.messages");
const customer_messages_1 = require("./customer.messages");
const booking_messages_1 = require("./booking.messages");
const service_messages_1 = require("./service.messages");
const category_messages_1 = require("./category.messages");
const payment_messages_1 = require("./payment.messages");
const config_messages_1 = require("./config.messages");
const offer_messages_1 = require("./offer.messages");
const common_messages_1 = require("./common.messages");
const role_messages_1 = require("./role.messages");
exports.MESSAGES = {
    AUTH: auth_messages_1.AUTH,
    USER: user_messages_1.USER,
    CUSTOMER: customer_messages_1.CUSTOMER,
    BOOKING: booking_messages_1.BOOKING,
    SERVICE: service_messages_1.SERVICE,
    SERVICE_TYPE: service_messages_1.SERVICE_TYPE,
    EXPERT: service_messages_1.EXPERT,
    CATEGORY: category_messages_1.CATEGORY,
    SUBCATEGORY: category_messages_1.SUBCATEGORY,
    PAYMENT: payment_messages_1.PAYMENT,
    TRANSACTION: payment_messages_1.TRANSACTION,
    CONFIGURATION: config_messages_1.CONFIGURATION,
    DASHBOARD: config_messages_1.DASHBOARD,
    CONTACT: config_messages_1.CONTACT,
    COMMON: common_messages_1.COMMON,
    ROLE: role_messages_1.ROLE,
    OFFER: offer_messages_1.OFFER,
    OFFER_VALIDATION: offer_messages_1.OFFER_VALIDATION,
};
