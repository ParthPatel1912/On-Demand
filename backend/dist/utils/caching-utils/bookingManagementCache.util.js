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
exports.clearBookingManagementCache = exports.bookingManagementCache = exports.BOOKING_MANAGEMENT_CACHE_GROUP = void 0;
const logger_1 = __importDefault(require("../logger"));
const redisCache_1 = require("./redisCache");
exports.BOOKING_MANAGEMENT_CACHE_GROUP = "booking:management";
// Admin booking-management cache
const bookingManagementCache = (ttlSeconds) => {
    return (req, res, next) => {
        const routePath = req.path;
        // Stable query key (important for filters like status, date, etc.)
        const queryKey = Object.keys(req.query || {})
            .sort()
            .map((key) => `${key}=${req.query[key]}`)
            .join("&");
        return (0, redisCache_1.createRedisCache)({
            ttlSeconds,
            keyPrefix: `${exports.BOOKING_MANAGEMENT_CACHE_GROUP}:${routePath}:${queryKey}`,
        })(req, res, next);
    };
};
exports.bookingManagementCache = bookingManagementCache;
// Clear after any booking-management write that affects list/filters.
const clearBookingManagementCache = () => __awaiter(void 0, void 0, void 0, function* () {
    logger_1.default.info("Clearing booking management admin cache");
    yield (0, redisCache_1.clearRedisCache)(exports.BOOKING_MANAGEMENT_CACHE_GROUP);
});
exports.clearBookingManagementCache = clearBookingManagementCache;
