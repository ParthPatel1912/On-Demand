"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearServiceAdminCache = exports.serviceAdminCache = exports.SERVICE_ADMIN_CACHE_GROUP = void 0;
const apiCache_util_1 = require("./apiCache.util");
exports.SERVICE_ADMIN_CACHE_GROUP = "service:admin";
// Service-management cache (shared; response already filtered by query params).
// Use for read endpoints that are frequently requested (e.g. list-by-category).
const serviceAdminCache = (ttlSeconds) => {
    return (0, apiCache_util_1.createApiCache)({
        ttlSeconds,
        group: exports.SERVICE_ADMIN_CACHE_GROUP,
        appendKey: () => "",
    });
};
exports.serviceAdminCache = serviceAdminCache;
// Clear after create/update/delete so list endpoints don't serve stale data.
const clearServiceAdminCache = () => {
    (0, apiCache_util_1.clearCacheGroup)(exports.SERVICE_ADMIN_CACHE_GROUP);
};
exports.clearServiceAdminCache = clearServiceAdminCache;
