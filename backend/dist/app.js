"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const compression_1 = __importDefault(require("compression"));
const index_1 = __importDefault(require("./routes/index"));
const error_middleware_1 = require("./middlewares/error.middleware");
const stripeWebhook_routes_1 = __importDefault(require("./routes/stripeWebhook.routes"));
const razorpayWebhook_routes_1 = __importDefault(require("./routes/razorpayWebhook.routes"));
const rateLimit_middleware_1 = require("./middlewares/rateLimit.middleware");
const response_util_1 = require("./utils/response.util");
const swagger_1 = __importDefault(require("./configs/swagger"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const app = (0, express_1.default)();
// Global Middleware
app.use("/api/webhook", stripeWebhook_routes_1.default);
app.use("/api/webhook", razorpayWebhook_routes_1.default);
app.use(express_1.default.json()); // Parse JSON body
app.use(express_1.default.urlencoded({ extended: true })); // Parse URL-encoded bodies
app.use((0, cors_1.default)()); // Enable Cross-Origin Resource Sharing
app.use((0, helmet_1.default)()); // Secure HTTP headers
app.use((0, compression_1.default)()); // Compress response bodies
app.use((req, res, next) => {
    res.set({
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        "Pragma": "no-cache",
        "Expires": "0",
        "Surrogate-Control": "no-store",
    });
    next();
}); // Disable client-side caching for all responses
app.use(rateLimit_middleware_1.getApiRateLimiter); // Common rate limit for all GET /api/*
// Health Check Route
app.get("/api/health", (req, res) => {
    return (0, response_util_1.sendResponse)(res, "Backend running 🚀", { timestamp: new Date().toISOString() });
});
// ----------------------
// API Routes
// ----------------------
app.use("/api", index_1.default); // <-- All module routes prefixed with /api
app.use('/api-docs', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swagger_1.default));
// ----------------------
// Global Error Handler
// ----------------------
app.use(error_middleware_1.errorHandler);
exports.default = app;
