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
exports.stripeWebhookHandler = void 0;
const stripeWebhook_service_1 = require("../services/stripeWebhook.service");
const stripe_1 = __importDefault(require("stripe"));
const dotenv_1 = __importDefault(require("dotenv"));
const response_util_1 = require("../utils/response.util");
const messages_1 = require("../constants/messages");
const enums_1 = require("../enums");
dotenv_1.default.config();
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || "";
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || "";
if (!STRIPE_SECRET_KEY || !STRIPE_WEBHOOK_SECRET) {
    throw new Error(messages_1.MESSAGES.PAYMENT.STRIPE_API_KEYS_NOT_SET);
}
const stripe = new stripe_1.default(STRIPE_SECRET_KEY, {
    apiVersion: "2026-03-25.dahlia",
});
const endpointSecret = STRIPE_WEBHOOK_SECRET;
const stripeWebhookHandler = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let event;
    try {
        const sig = req.headers["stripe-signature"];
        event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    }
    catch (err) {
        return (0, response_util_1.sendError)(res, `Webhook Error: ${err.message}`, enums_1.STATUS_CODE.BAD_REQUEST);
    }
    yield (0, stripeWebhook_service_1.handleStripeEvent)(event);
    return (0, response_util_1.sendResponse)(res, { received: true });
});
exports.stripeWebhookHandler = stripeWebhookHandler;
