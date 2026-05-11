"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearBookingManagementCache = exports.bookingManagementCache = exports.BOOKING_MANAGEMENT_CACHE_GROUP = void 0;
const apiCache_util_1 = require("./apiCache.util");
exports.BOOKING_MANAGEMENT_CACHE_GROUP = "booking:management";
// Admin booking-management cache must be separated per user (admin) to avoid mixing
// responses when permissions/roles differ.
function bookingManagementAppendKey(req, _res) {
    var _a;
    const maybeUser = req.user;
    const userId = (_a = maybeUser === null || maybeUser === void 0 ? void 0 : maybeUser.id) !== null && _a !== void 0 ? _a : maybeUser === null || maybeUser === void 0 ? void 0 : maybeUser.sub;
    if (userId !== undefined && userId !== null && `${userId}`.trim() !== "") {
        return `user:${userId}`;
    }
    return "anon";
}
const bookingManagementCache = (ttlSeconds) => {
    return (0, apiCache_util_1.createApiCache)({
        ttlSeconds,
        group: exports.BOOKING_MANAGEMENT_CACHE_GROUP,
        appendKey: bookingManagementAppendKey,
    });
};
exports.bookingManagementCache = bookingManagementCache;
// Clear after any booking-management write that affects list/filters.
const clearBookingManagementCache = () => {
    (0, apiCache_util_1.clearCacheGroup)(exports.BOOKING_MANAGEMENT_CACHE_GROUP);
};
exports.clearBookingManagementCache = clearBookingManagementCache;
