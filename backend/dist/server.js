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
require("dotenv/config");
const app_1 = __importDefault(require("./app"));
const db_1 = __importDefault(require("./configs/db"));
const logger_1 = __importDefault(require("./utils/logger"));
const socket_1 = require("./socket");
const http_1 = __importDefault(require("http"));
const bookingCleanup_job_1 = require("./jobs/bookingCleanup.job");
require("./jobs/workers/email.worker");
const email_queue_1 = require("./jobs/queues/email.queue");
const email_worker_1 = __importDefault(require("./jobs/workers/email.worker"));
const redis_config_1 = __importDefault(require("./configs/redis.config"));
const PORT = Number(process.env.PORT) || 5000;
const server = http_1.default.createServer(app_1.default);
(0, socket_1.initSocket)(server);
if (process.env.ENABLE_BOOKING_CRON === "true") {
    (0, bookingCleanup_job_1.initBookingCleanupJob)();
}
server.listen(PORT, () => {
    logger_1.default.info(`Server running in ${process.env.NODE_ENV || "development"} mode on port ${PORT}`);
});
// Optional: test DB connection separately
(() => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield db_1.default.authenticate();
        logger_1.default.info("Database connected successfully ✅");
    }
    catch (err) {
        logger_1.default.error("Unable to connect to DB ❌");
        logger_1.default.error(err);
    }
}))();
const shutdown = (signal) => __awaiter(void 0, void 0, void 0, function* () {
    logger_1.default.info(`\nReceived ${signal}. Closing server...`);
    try {
        // Close Queues and Workers
        yield email_queue_1.emailQueue.close();
        yield email_worker_1.default.close();
        logger_1.default.info("Job queues and workers closed ✅");
        // Close Redis Client
        if (redis_config_1.default.isOpen) {
            yield redis_config_1.default.quit();
            logger_1.default.info("Redis client connection closed ✅");
        }
        // Stop accepting new requests
        server.close(() => __awaiter(void 0, void 0, void 0, function* () {
            logger_1.default.info("HTTP server closed");
            // Close DB connections
            yield db_1.default.close();
            logger_1.default.info("Database connection closed ✅");
            process.exit(0);
        }));
        // Force shutdown if stuck
        setTimeout(() => {
            logger_1.default.error("Force shutting down...");
            process.exit(1);
        }, 10000);
    }
    catch (err) {
        logger_1.default.error("Error during shutdown", err);
        process.exit(1);
    }
});
// Listen to shutdown signals
process.on("SIGINT", shutdown); // Ctrl + C
process.on("SIGTERM", shutdown); // Docker / PM2
