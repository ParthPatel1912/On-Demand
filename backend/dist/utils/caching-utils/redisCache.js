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
exports.clearRedisCache = exports.createRedisCache = void 0;
const redis_config_1 = __importDefault(require("../../configs/redis.config"));
const logger_1 = __importDefault(require("../logger"));
const createRedisCache = (opts) => {
    return (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        if (!opts.ttlSeconds || opts.ttlSeconds <= 0)
            return next();
        const key = `${opts.keyPrefix || "cache"}:` + `${req.originalUrl}`;
        try {
            const cached = yield redis_config_1.default.get(key);
            if (cached) {
                return res.json(JSON.parse(cached));
            }
            const originalJson = res.json.bind(res);
            res.json = (body) => {
                redis_config_1.default
                    .setEx(key, opts.ttlSeconds, JSON.stringify(body))
                    .catch((err) => {
                    logger_1.default.error("Redis cache set error:", err);
                });
                return originalJson(body);
            };
            next();
        }
        catch (err) {
            logger_1.default.error("Redis cache error:", err);
            next();
        }
    });
};
exports.createRedisCache = createRedisCache;
/**
 * Scan Redis keys safely (non-blocking alternative to KEYS)
 */
function scanKeys(pattern) {
    return __awaiter(this, void 0, void 0, function* () {
        let cursor = "0";
        const keys = [];
        do {
            const result = yield redis_config_1.default.scan(cursor, {
                MATCH: pattern,
                COUNT: 100,
            });
            cursor = result.cursor;
            keys.push(...result.keys);
        } while (cursor !== "0");
        return keys;
    });
}
/**
 * Clear cache by prefix or pattern
 *
 * Examples:
 *  clearCache("dashboard")
 *  clearCache("users:*")
 *  clearCache("ratelimit:*")
 */
const clearRedisCache = (pattern) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Normalize pattern
        const finalPattern = pattern.includes("*") ? pattern : `${pattern}:*`;
        const keys = yield scanKeys(finalPattern);
        if (!keys.length)
            return 0;
        const deleted = yield redis_config_1.default.del(keys);
        return deleted;
    }
    catch (err) {
        logger_1.default.error("Redis clearCache error:", err);
        return 0;
    }
});
exports.clearRedisCache = clearRedisCache;
