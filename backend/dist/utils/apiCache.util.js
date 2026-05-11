"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearCacheGroup = exports.createApiCache = void 0;
const apicache_1 = __importDefault(require("apicache"));
let configured = false;
function configureApicache() {
    if (configured)
        return;
    configured = true;
    /**
     * Global apicache configuration.
     *
     * Notes:
     * - In-memory cache: resets on server restart and is per-instance.
     * - For multi-instance / persistence, configure `redisClient`.
     * - `respectCacheControl: false` avoids browser/devtools `cache-control: no-cache`
     *   bypassing the server cache.
     */
    apicache_1.default.options({
        debug: false,
        // Don't bypass server-side cache based on client request cache-control headers.
        respectCacheControl: false,
        statusCodes: {
            include: [200],
            exclude: [401, 403, 500],
        },
    });
}
const createApiCache = (opts) => {
    var _a;
    configureApicache();
    const ttlSeconds = opts.ttlSeconds;
    if (!Number.isFinite(ttlSeconds) || ttlSeconds <= 0) {
        return (_req, _res, next) => next();
    }
    const duration = `${Math.floor(ttlSeconds)} seconds`;
    const cache = apicache_1.default.middleware(duration, undefined, {
        appendKey: (_a = opts.appendKey) !== null && _a !== void 0 ? _a : (() => ""),
    });
    return (req, res, next) => {
        // Group allows clearing multiple keys at once (e.g. on POST/PATCH/DELETE).
        if (opts.group)
            req.apicacheGroup = opts.group;
        return cache(req, res, next);
    };
};
exports.createApiCache = createApiCache;
const clearCacheGroup = (group) => {
    configureApicache();
    apicache_1.default.clear(group);
};
exports.clearCacheGroup = clearCacheGroup;
