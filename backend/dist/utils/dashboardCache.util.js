"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearDashboardCache = exports.dashboardCache = exports.DASHBOARD_CACHE_GROUP = void 0;
const apiCache_util_1 = require("./apiCache.util");
exports.DASHBOARD_CACHE_GROUP = "dashboard";
// Dashboard is user-scoped (admin) and depends on bookings/users/partners counts.
// Cache keys include the query string (e.g. `?period=week|month|year`) via apicache's
// default key generator (req.originalUrl) + this per-user appendKey.
function dashboardAppendKey(req, _res) {
    var _a;
    const maybeUser = req.user;
    const userId = (_a = maybeUser === null || maybeUser === void 0 ? void 0 : maybeUser.id) !== null && _a !== void 0 ? _a : maybeUser === null || maybeUser === void 0 ? void 0 : maybeUser.sub;
    if (userId !== undefined && userId !== null && `${userId}`.trim() !== "") {
        return `user:${userId}`;
    }
    return "anon";
}
const dashboardCache = (ttlSeconds) => {
    return (0, apiCache_util_1.createApiCache)({
        ttlSeconds,
        group: exports.DASHBOARD_CACHE_GROUP,
        appendKey: dashboardAppendKey,
    });
};
exports.dashboardCache = dashboardCache;
// Clear when dashboard-driving data changes (typically bookings status updates).
const clearDashboardCache = () => {
    (0, apiCache_util_1.clearCacheGroup)(exports.DASHBOARD_CACHE_GROUP);
};
exports.clearDashboardCache = clearDashboardCache;
