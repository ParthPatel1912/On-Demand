"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.redisClient = exports.redisConnection = void 0;
const redis_1 = require("redis");
const dotenv_1 = __importDefault(require("dotenv"));
const logger_1 = __importDefault(require("../utils/logger"));
dotenv_1.default.config();
const redisUrl = process.env.REDIS_URL;
const redisPort = process.env.REDIS_PORT || 18666;
if (!redisUrl) {
    throw new Error("REDIS_URL is missing in environment variables. Please check your .env file.");
}
/**
 * BullMQ Connection options
 */
exports.redisConnection = {
    host: process.env.REDIS_URL,
    port: Number(redisPort),
    username: process.env.REDIS_USERNAME,
    password: process.env.REDIS_PASSWORD,
    maxRetriesPerRequest: null, // Required for BullMQ
    enableReadyCheck: false, // Faster and uses fewer commands during connection
};
/**
 * Redis Client for general app usage (Node-Redis)
 */
exports.redisClient = (0, redis_1.createClient)({
    username: process.env.REDIS_USERNAME,
    password: process.env.REDIS_PASSWORD,
    socket: {
        host: process.env.REDIS_URL,
        port: Number(redisPort),
        reconnectStrategy: (retries) => {
            if (retries > 10) {
                logger_1.default.error("Redis reconnection failed after 10 attempts.");
                return new Error("Redis reconnection failed");
            }
            return Math.min(retries * 500, 5000);
        },
    },
});
exports.redisClient.on("error", (err) => {
    if (err.message.includes("max number of clients reached")) {
        logger_1.default.error("CRITICAL: Redis connection limit reached on Redis Cloud! Please check active connections.");
    }
    else {
        logger_1.default.error("Redis Client Error: ", err);
    }
});
exports.redisClient.on("connect", () => {
    logger_1.default.info("Redis Client Connecting to Redis Cloud...");
});
exports.redisClient.on("ready", () => {
    logger_1.default.info("Redis Client Connected and Ready ✅");
});
// client MUST be explicitly connected
if (!exports.redisClient.isOpen) {
    exports.redisClient.connect().catch((err) => {
        logger_1.default.error("Redis Client failed to connect", err);
    });
}
exports.default = exports.redisClient;
