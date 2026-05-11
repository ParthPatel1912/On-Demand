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
const homeController = __importStar(require("../controllers/home.controller"));
const landingCache_util_1 = require("../utils/caching-utils/landingCache.util");
const router = (0, express_1.Router)();
/**
 * @name getServiceTypes
 * @description Returns service types for the customer home page (cached).
 * @access Public
 */
router.get("/service-types", (0, landingCache_util_1.landingHomeCache)(120), homeController.getServiceTypes);
/**
 * @name getPopularServices
 * @description Returns popular services ranked by bookings (cached).
 * @access Public
 */
router.get("/services/popular", (0, landingCache_util_1.landingHomeCache)(120), homeController.getPopularServices);
/**
 * @name getAllServices
 * @description Returns latest services list for home page (cached).
 * @access Public
 */
router.get("/services/all", (0, landingCache_util_1.landingHomeCache)(120), homeController.getAllServices);
/**
 * @name searchServices
 * @description Searches services by name with optional limit.
 * @access Public
 */
router.get("/services/search", homeController.searchServices);
exports.default = router;
