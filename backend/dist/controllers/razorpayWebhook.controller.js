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
exports.razorpayWebhookHandler = void 0;
const razorpayWebhook_service_1 = require("../services/razorpayWebhook.service");
const razorpay_1 = __importDefault(require("razorpay"));
const logger_1 = __importDefault(require("../utils/logger"));
const dotenv_1 = __importDefault(require("dotenv"));
const response_util_1 = require("../utils/response.util");
const messages_1 = require("../constants/messages");
const enums_1 = require("../enums");
const common_utils_1 = require("../utils/common.utils");
dotenv_1.default.config();
const RAZORPAY_WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET || "";
/**
 * @name razorpayWebhookHandler
 * @description
 * Express route handler for Razorpay webhooks. Validates the webhook signature and processes the event payload.
 * Handles events such as payment captured, payment failed, and order expiration to update booking and payment records accordingly.
 * @access Private
 */
const razorpayWebhookHandler = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const signature = req.headers["x-razorpay-signature"];
    if (!RAZORPAY_WEBHOOK_SECRET) {
        logger_1.default.error("RAZORPAY_WEBHOOK_SECRET is missing");
        return (0, response_util_1.sendError)(res, messages_1.MESSAGES.COMMON.CONFIG_ERROR, enums_1.STATUS_CODE.INTERNAL_SERVER_ERROR);
    }
    const rawBody = req.body.toString();
    const isValid = razorpay_1.default.validateWebhookSignature(rawBody, signature, RAZORPAY_WEBHOOK_SECRET);
    if (!isValid) {
        logger_1.default.warn("Invalid Razorpay webhook signature");
        return (0, response_util_1.sendError)(res, messages_1.MESSAGES.PAYMENT.INVALID_SIGNATURE, enums_1.STATUS_CODE.BAD_REQUEST);
    }
    try {
        const payload = JSON.parse(rawBody);
        yield (0, razorpayWebhook_service_1.handleRazorpayEvent)(payload);
        return (0, response_util_1.sendResponse)(res, { status: "ok" });
    }
    catch (error) {
        logger_1.default.error(`Razorpay Webhook Processing Error: ${(0, common_utils_1.getErrorMessage)(error)}`);
        return (0, response_util_1.sendError)(res, messages_1.MESSAGES.COMMON.SERVER_ERROR, enums_1.STATUS_CODE.INTERNAL_SERVER_ERROR);
    }
});
exports.razorpayWebhookHandler = razorpayWebhookHandler;
