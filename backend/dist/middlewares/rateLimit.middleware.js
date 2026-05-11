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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getApiRateLimiter = void 0;
exports.numberFromEnv = numberFromEnv;
exports.createUserOrIpRateLimiter = createUserOrIpRateLimiter;
const express_rate_limit_1 = __importStar(require("express-rate-limit"));
const rate_limit_redis_1 = __importDefault(require("rate-limit-redis"));
const redis_config_1 = __importDefault(require("../configs/redis.config"));
function createRedisStore(prefix) {
    return new rate_limit_redis_1.default({
        prefix,
        sendCommand: (...args) => redis_config_1.default.sendCommand(args),
    });
}
function numberFromEnv(name, fallback) {
    const raw = process.env[name];
    if (!raw)
        return fallback;
    const parsed = Number(raw);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}
const windowMs = numberFromEnv("RATE_LIMIT_GET_WINDOW_MS", 60000);
const limit = numberFromEnv("RATE_LIMIT_GET_MAX", 60);
// Global GET /api/* limiter (except /api/webhook/*). See src/app.ts.
exports.getApiRateLimiter = (0, express_rate_limit_1.default)({
    store: createRedisStore("rl:get"),
    windowMs,
    limit,
    keyGenerator: rateLimitKey,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: "Too many requests, please try again later." },
    skip: (req) => req.method !== "GET" ||
        !req.path.startsWith("/api") ||
        req.path.startsWith("/api/webhook"),
});
function rateLimitKey(req) {
    var _a, _b, _c, _d, _e;
    const maybeUser = req.user;
    const userId = (_a = maybeUser === null || maybeUser === void 0 ? void 0 : maybeUser.id) !== null && _a !== void 0 ? _a : maybeUser === null || maybeUser === void 0 ? void 0 : maybeUser.sub;
    const route = `${req.method}:${req.baseUrl}${((_b = req.route) === null || _b === void 0 ? void 0 : _b.path) || req.path}`;
    if (userId !== undefined && userId !== null && `${userId}`.trim() !== "") {
        return `rl:${route}:user:${userId}`;
    }
    const ip = (_e = (_c = req.ip) !== null && _c !== void 0 ? _c : (_d = req.socket) === null || _d === void 0 ? void 0 : _d.remoteAddress) !== null && _e !== void 0 ? _e : "unknown";
    return `ratelimit:${route}:ip:${(0, express_rate_limit_1.ipKeyGenerator)(ip)}`;
}
function createUserOrIpRateLimiter(name, opts) {
    return (0, express_rate_limit_1.default)({
        store: createRedisStore(`rl:${name}:${opts.windowMs}:${opts.limit}:`),
        windowMs: opts.windowMs,
        limit: opts.limit,
        standardHeaders: true,
        legacyHeaders: false,
        keyGenerator: rateLimitKey,
        message: { message: "Too many requests, please try again later." },
    });
}
