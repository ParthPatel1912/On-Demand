"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
const bullmq_1 = require("bullmq");
const redis_config_1 = require("../../configs/redis.config");
const mailUtils = __importStar(require("../../utils/mail.util"));
const logger_1 = __importDefault(require("../../utils/logger"));
const email_enum_1 = require("../../enums/email.enum");
/**
 * @name emailWorker
 * @description
 * BullMQ Worker for processing email jobs.
 * Handles different types of email jobs such as sending admin credentials, partner approval emails, and forgot password emails.
 * Listens for job completion and failure events to log the outcomes.
 * @access Private
 */
const emailWorker = new bullmq_1.Worker("emailQueue", (job) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, data } = job;
    logger_1.default.info(`[Worker] Started processing job ${job.id} (Type: ${name})`);
    try {
        switch (name) {
            case email_enum_1.EMAIL_WORKER.SEND_ADMIN_CREDENTIALS:
                yield mailUtils.sendAdminCredentialsDirect(data.email, data.name, data.password);
                break;
            case email_enum_1.EMAIL_WORKER.SEND_PARTNER_APPROVAL:
                yield mailUtils.sendPartnerApprovalEmailDirect(data.email, data.name, data.resetLink);
                break;
            case email_enum_1.EMAIL_WORKER.SEND_PARTNER_REJECTION:
                yield mailUtils.sendPartnerRejectionEmailDirect(data.email, data.name);
                break;
            case email_enum_1.EMAIL_WORKER.SEND_FORGOT_PASSWORD:
                yield mailUtils.sendForgotPasswordEmailDirect(data.email, data.name, data.resetLink);
                break;
            case email_enum_1.EMAIL_WORKER.SEND_BOOKING_CONFIRMATION:
                yield mailUtils.sendBookingConfirmationEmailDirect(data.email, data.name, data.bookingId, data.serviceName, data.slot, data.amount);
                break;
            default:
                logger_1.default.warn(`[Worker] Unknown email job type: ${name}`);
        }
    }
    catch (error) {
        logger_1.default.error(`[Worker] Failed to process email job ${job.id}:`, error);
        throw error;
    }
}), { connection: redis_config_1.redisConnection });
emailWorker.on("ready", () => {
    logger_1.default.info("[Worker] Email worker is ready and connected to Redis ✅");
});
emailWorker.on("error", (err) => {
    logger_1.default.error("[Worker] Email worker critical error:", err);
});
emailWorker.on("completed", (job) => {
    logger_1.default.info(`[Worker] Email job ${job.id} completed successfully ✅`);
});
emailWorker.on("failed", (job, err) => {
    logger_1.default.error(`[Worker] Email job ${job === null || job === void 0 ? void 0 : job.id} failed with error: ${err.message}`);
});
exports.default = emailWorker;
