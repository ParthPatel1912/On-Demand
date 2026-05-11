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
const adminCustomerController = __importStar(require("../controllers/adminCustomer.controller"));
const adminCustomerBookingsController = __importStar(require("../controllers/adminCustomerBookings.controller"));
const auth_middleware_1 = require("../middlewares/auth.middleware");
const validate_middleware_1 = require("../middlewares/validate.middleware");
const adminCustomer_validation_1 = require("../validations/adminCustomer.validation");
const router = (0, express_1.Router)();
/**
 * Admin Customer Routes
 * Base path: /api/admin-customers
 */
router.get("/", auth_middleware_1.verifyJWT, auth_middleware_1.checkActiveUser, adminCustomerController.listCustomers);
router.post("/add-customer", auth_middleware_1.verifyJWT, auth_middleware_1.checkActiveUser, (0, validate_middleware_1.validate)(adminCustomer_validation_1.createCustomerValidation), adminCustomerController.createCustomer);
router.patch("/block-customer/:id", auth_middleware_1.verifyJWT, auth_middleware_1.checkActiveUser, (0, validate_middleware_1.validate)(adminCustomer_validation_1.updateCustomerStatusValidation), adminCustomerController.updateCustomerStatus);
router.delete("/delete-customer/:id", auth_middleware_1.verifyJWT, auth_middleware_1.checkActiveUser, adminCustomerController.deleteCustomer);
// Customer detail
router.get("/:id", auth_middleware_1.verifyJWT, auth_middleware_1.checkActiveUser, adminCustomerBookingsController.getCustomerDetailById);
// Customer bookings (with filters + pagination)
router.get("/:id/booking-services", auth_middleware_1.verifyJWT, auth_middleware_1.checkActiveUser, adminCustomerBookingsController.getCustomerBookingServices);
exports.default = router;
