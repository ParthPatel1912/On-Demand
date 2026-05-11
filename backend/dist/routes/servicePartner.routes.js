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
const servicePartnerController = __importStar(require("../controllers/servicePartner.controller"));
const upload_middleware_1 = require("../middlewares/upload.middleware");
const validate_middleware_1 = require("../middlewares/validate.middleware");
const servicePartner_validation_1 = require("../validations/servicePartner.validation");
const dataParser_middleware_1 = require("../middlewares/dataParser.middleware");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const userRole_enum_1 = require("../enums/userRole.enum");
const router = (0, express_1.Router)();
/**
 * @swagger
 * tags:
 *   name: Service Partners
 *   description: Service partner management for registration, approval, and service assignment.
 */
/**
 * @swagger
 * components:
 *   schemas:
 *     ServicePartnerRegisterPayload:
 *       type: object
 *       required:
 *         - fullName
 *         - email
 *         - dob
 *         - gender
 *         - mobile
 *         - applyingFor
 *       properties:
 *         fullName:
 *           type: string
 *           example: "John Doe"
 *         email:
 *           type: string
 *           example: "john.doe@example.com"
 *         dob:
 *           type: string
 *           format: date
 *           example: "1990-01-01"
 *         gender:
 *           type: string
 *           enum: [Male, Female]
 *         mobile:
 *           type: string
 *           example: "+1234567890"
 *         applyingFor:
 *           type: integer
 *           description: Service Type ID
 *         permanentAddress:
 *           type: string
 *         residentialAddress:
 *           type: string
 *         education:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               school: { type: string }
 *               year: { type: string }
 *               marks: { type: string }
 *         professional:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               company: { type: string }
 *               role: { type: string }
 *               from: { type: string }
 *               to: { type: string }
 *         skills:
 *           type: array
 *           items: { type: integer }
 *         servicesOffered:
 *           type: array
 *           items: { type: integer }
 *         languages:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               language: { type: string }
 *               proficiency: { type: string }
 *         profileImage:
 *           type: string
 *           format: binary
 *         attachments:
 *           type: array
 *           items:
 *             type: string
 *             format: binary
 *     ApproveRejectPayload:
 *       type: object
 *       required:
 *         - action
 *       properties:
 *         action:
 *           type: string
 *           enum: [approve, reject]
 */
/**
 * @swagger
 * /api/service-partners:
 *   post:
 *     summary: Register a new service partner
 *     description: Create a service partner profile with optional profile image and document attachments.
 *     tags: [Service Partners]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             $ref: '#/components/schemas/ServicePartnerRegisterPayload'
 *     responses:
 *       201:
 *         description: Successfully registered
 */
router.post("/", upload_middleware_1.upload.fields([
    { name: "profileImage", maxCount: 1 },
    { name: "attachments", maxCount: 10 }
]), dataParser_middleware_1.partnerDataParser, (0, validate_middleware_1.validate)(servicePartner_validation_1.registerPartnerValidation), servicePartnerController.register);
/**
 * @swagger
 * /api/service-partners:
 *   get:
 *     summary: List all service partners
 *     description: Retrieve a paginated list of service partners with filtering by status and service type.
 *     tags: [Service Partners]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *       - in: query
 *         name: status
 *         schema: { type: string }
 *       - in: query
 *         name: serviceTypeId
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Success
 */
router.get("/", auth_middleware_1.verifyJWT, auth_middleware_1.checkActiveUser, (0, auth_middleware_1.authorizeRoles)(userRole_enum_1.UserRole.ADMIN, userRole_enum_1.UserRole.SUPER_ADMIN), servicePartnerController.getAllPartners);
/**
 * @swagger
 * /api/service-partners/{id}/status:
 *   patch:
 *     summary: Toggle partner status
 *     description: Activate or deactivate a partner user account.
 *     tags: [Service Partners]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Status updated
 */
router.patch("/:id/status", auth_middleware_1.verifyJWT, auth_middleware_1.checkActiveUser, (0, auth_middleware_1.authorizeRoles)(userRole_enum_1.UserRole.ADMIN, userRole_enum_1.UserRole.SUPER_ADMIN), servicePartnerController.updatePartnerStatus);
/**
 * @swagger
 * /api/service-partners/{id}:
 *   delete:
 *     summary: Delete a partner
 *     description: Permanently remove a partner profile and their user account.
 *     tags: [Service Partners]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Partner deleted
 */
router.delete("/:id", auth_middleware_1.verifyJWT, auth_middleware_1.checkActiveUser, (0, auth_middleware_1.authorizeRoles)(userRole_enum_1.UserRole.ADMIN, userRole_enum_1.UserRole.SUPER_ADMIN), servicePartnerController.deletePartner);
/**
 * @swagger
 * /api/service-partners/{id}/approval:
 *   patch:
 *     summary: Approve or reject partner
 *     description: Finalize the verification of a partner registration.
 *     tags: [Service Partners]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ApproveRejectPayload'
 *     responses:
 *       200:
 *         description: Approval action completed
 */
router.patch("/:id/approval", auth_middleware_1.verifyJWT, auth_middleware_1.checkActiveUser, (0, auth_middleware_1.authorizeRoles)(userRole_enum_1.UserRole.ADMIN, userRole_enum_1.UserRole.SUPER_ADMIN), (0, validate_middleware_1.validate)(servicePartner_validation_1.approveRejectPartnerValidation), servicePartnerController.approveRejectPartner);
/**
 * @swagger
 * /api/service-partners/{id}:
 *   get:
 *     summary: Get partner details
 *     description: Fetch full profile details of a service partner.
 *     tags: [Service Partners]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Success
 */
router.get("/:id", auth_middleware_1.verifyJWT, auth_middleware_1.checkActiveUser, (0, auth_middleware_1.authorizeRoles)(userRole_enum_1.UserRole.ADMIN, userRole_enum_1.UserRole.SUPER_ADMIN), servicePartnerController.getPartnerById);
/**
 * @swagger
 * /api/service-partners/{id}/assigned-services:
 *   get:
 *     summary: Get assigned services
 *     description: Retrieve bookings assigned to the partner.
 *     tags: [Service Partners]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *       - in: query
 *         name: status
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Success
 */
router.get("/:id/assigned-services", auth_middleware_1.verifyJWT, auth_middleware_1.checkActiveUser, (0, auth_middleware_1.authorizeRoles)(userRole_enum_1.UserRole.ADMIN, userRole_enum_1.UserRole.SUPER_ADMIN, userRole_enum_1.UserRole.SERVICE_PARTNER), servicePartnerController.getAssignedServices);
exports.default = router;
