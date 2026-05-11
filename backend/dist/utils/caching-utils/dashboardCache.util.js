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
exports.clearDashboardCache = exports.dashboardCache = exports.DASHBOARD_CACHE_GROUP = void 0;
const logger_1 = __importDefault(require("../logger"));
const redisCache_1 = require("./redisCache");
exports.DASHBOARD_CACHE_GROUP = "dashboard";
const dashboardCache = (options) => {
    return (req, res, next) => {
        let ttlSeconds;
        ttlSeconds = options;
        return (0, redisCache_1.createRedisCache)({
            ttlSeconds,
            keyPrefix: `${exports.DASHBOARD_CACHE_GROUP}:${req.path}`,
        })(req, res, next);
    };
};
exports.dashboardCache = dashboardCache;
// Clear when dashboard-driving data changes
const clearDashboardCache = () => __awaiter(void 0, void 0, void 0, function* () {
    logger_1.default.info("Clearing admin dashboard cache");
    yield (0, redisCache_1.clearRedisCache)(exports.DASHBOARD_CACHE_GROUP);
});
exports.clearDashboardCache = clearDashboardCache;
