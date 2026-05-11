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
exports.addEmailJob = exports.emailQueue = void 0;
const bullmq_1 = require("bullmq");
const redis_config_1 = require("../../configs/redis.config");
const logger_1 = __importDefault(require("../../utils/logger"));
/**
 * BullMQ Queue for handling email jobs.
 */
exports.emailQueue = new bullmq_1.Queue("emailQueue", {
    connection: redis_config_1.redisConnection,
    defaultJobOptions: {
        removeOnComplete: true,
        removeOnFail: true,
    }
});
/**
 * @name addEmailJob
 * @description
 * Adds a new email job to the queue with specified name and data.
 * Includes retry logic with exponential backoff for failed jobs.
 * @access Private
 */
const addEmailJob = (name, data) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        logger_1.default.info(`[Queue] Adding email job to queue (Type: ${name})`);
        yield exports.emailQueue.add(name, data, {
            attempts: 3,
            backoff: {
                type: "exponential",
                delay: 1000,
            },
        });
    }
    catch (err) {
        logger_1.default.error(`[Queue] Failed to add email job to queue (Type: ${name}):`, err);
        throw err;
    }
});
exports.addEmailJob = addEmailJob;
