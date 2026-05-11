"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const razorpayWebhook_controller_1 = require("../controllers/razorpayWebhook.controller");
const router = express_1.default.Router();
router.post("/razorpay", express_1.default.raw({ type: "application/json" }), razorpayWebhook_controller_1.razorpayWebhookHandler);
exports.default = router;
