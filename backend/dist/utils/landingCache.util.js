"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearLandingHomeCache = exports.landingHomeCache = exports.LANDING_HOME_CACHE_GROUP = void 0;
const apiCache_util_1 = require("./apiCache.util");
exports.LANDING_HOME_CACHE_GROUP = "landing:home";
// Public landing-page cache (shared across all users).
const landingHomeCache = (ttlSeconds) => {
    return (0, apiCache_util_1.createApiCache)({
        ttlSeconds,
        group: exports.LANDING_HOME_CACHE_GROUP,
        appendKey: () => "",
    });
};
exports.landingHomeCache = landingHomeCache;
// Clear when landing-page relevant entities change (service/service-type/category/etc).
const clearLandingHomeCache = () => {
    (0, apiCache_util_1.clearCacheGroup)(exports.LANDING_HOME_CACHE_GROUP);
};
exports.clearLandingHomeCache = clearLandingHomeCache;
