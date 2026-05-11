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
exports.clearServiceAdminCache = exports.serviceAdminCache = exports.SERVICE_ADMIN_CACHE_GROUP = void 0;
const logger_1 = __importDefault(require("../logger"));
const redisCache_1 = require("./redisCache");
exports.SERVICE_ADMIN_CACHE_GROUP = "service:admin";
// Service-management cache (shared; response already filtered by query params).
// Use for read endpoints that are frequently requested (e.g. list-by-category).
const serviceAdminCache = (ttlSeconds) => {
    return (req, res, next) => {
        const routePath = req.path;
        // Stable query key (prevents order issues)
        const queryKey = Object.keys(req.query || {})
            .sort()
            .map((key) => `${key}=${req.query[key]}`)
            .join("&");
        return (0, redisCache_1.createRedisCache)({
            ttlSeconds,
            keyPrefix: `${exports.SERVICE_ADMIN_CACHE_GROUP}:${routePath}:${queryKey}`,
        })(req, res, next);
    };
};
exports.serviceAdminCache = serviceAdminCache;
// Clear after create/update/delete so list endpoints don't serve stale data.
const clearServiceAdminCache = () => __awaiter(void 0, void 0, void 0, function* () {
    logger_1.default.info("Clearing service management admin cache");
    yield (0, redisCache_1.clearRedisCache)(exports.SERVICE_ADMIN_CACHE_GROUP);
});
exports.clearServiceAdminCache = clearServiceAdminCache;
