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
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const dashboardController = __importStar(require("../controllers/dashboard.controller"));
const auth_middleware_1 = require("../middlewares/auth.middleware");
const dashboardCache_util_1 = require("../utils/caching-utils/dashboardCache.util");
const dashboard_controller_1 = require("../controllers/dashboard.controller");
const router = (0, express_1.Router)();
/**
 * @name getDashboardOverview
 * @description Returns admin dashboard KPIs/charts for a all period. Cached by period buckets.
 * @access Role-based
 */
router.get("/overview", auth_middleware_1.verifyJWT, auth_middleware_1.checkActiveUser, (0, dashboardCache_util_1.dashboardCache)(120), dashboardController.getDashboardOverview);
/**
 * @name getServicePartnerDashboardController
 * @description Returns service partner analytics for a period (?period=week|month|year).
 * @access Role-based
 */
router.get("/analytics", auth_middleware_1.verifyJWT, auth_middleware_1.checkActiveUser, dashboard_controller_1.getServicePartnerDashboardController);
exports.default = router;
