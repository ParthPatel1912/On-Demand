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
const serviceTypeController = __importStar(require("../controllers/serviceType.controller"));
const upload_middleware_1 = require("../middlewares/upload.middleware");
const validate_middleware_1 = require("../middlewares/validate.middleware");
const serviceType_validation_1 = require("../validations/serviceType.validation");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
/**
 * @swagger
 * tags:
 *   name: ServiceTypes
 *   description: API for managing service types (e.g., Cleaning, Repair)
 */
/**
 * @swagger
 * /api/service-types:
 *   get:
 *     summary: Get all service types
 *     tags: [ServiceTypes]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of items per page
 *     security: []
 *     responses:
 *       200:
 *         description: List of service types
 */
router.get("/", serviceTypeController.getAll);
/**
 * @swagger
 * /api/service-types/public:
 *   get:
 *     summary: Get all service types with completed booking counts (Public)
 *     tags: [ServiceTypes]
 *     security: []
 *     responses:
 *       200:
 *         description: List of service types with booking counts
 */
router.get("/public", serviceTypeController.getPublicUserAllService);
/**
 * @swagger
 * /api/service-types/hierarchy:
 *   get:
 *     summary: Get service types hierarchy (nested categories/subcategories)
 *     tags: [ServiceTypes]
 *     responses:
 *       200:
 *         description: Full or partner-scoped hierarchy
 *       401:
 *         description: Unauthorized
 */
router.get("/hierarchy", auth_middleware_1.verifyJWT, auth_middleware_1.checkActiveUser, serviceTypeController.getAllHierarchy);
/**
 * @swagger
 * /api/service-types/{id}:
 *   get:
 *     summary: Get service type by ID with its full hierarchy
 *     tags: [ServiceTypes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     security: []
 *     responses:
 *       200:
 *         description: Service type details
 *       404:
 *         description: Not found
 */
router.get("/:id", serviceTypeController.getById);
/**
 * @swagger
 * /api/service-types/{id}/services:
 *   get:
 *     summary: List available services for a service type
 *     tags: [ServiceTypes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Search query
 *       - in: query
 *         name: subCategoryId
 *         schema:
 *           type: integer
 *         description: Filter by subcategory ID
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     security: []
 *     responses:
 *       200:
 *         description: List of services
 */
router.get("/:id/services", serviceTypeController.listServices);
/**
 * @swagger
 * /api/service-types:
 *   post:
 *     summary: Create a new service type (Admin only)
 *     tags: [ServiceTypes]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               image:
 *                 type: string
 *                 format: binary
 *               bannerImage:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Created
 *       400:
 *         description: Bad request
 *       403:
 *         description: Forbidden
 */
router.post("/", auth_middleware_1.verifyJWT, auth_middleware_1.checkActiveUser, upload_middleware_1.upload.fields([
    { name: "image", maxCount: 1 },
    { name: "bannerImage", maxCount: 1 },
]), (0, validate_middleware_1.validate)(serviceType_validation_1.createValidation), serviceTypeController.create);
/**
 * @swagger
 * /api/service-types/{id}:
 *   put:
 *     summary: Update a service type (Admin only)
 *     tags: [ServiceTypes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               image:
 *                 type: string
 *                 format: binary
 *               bannerImage:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Updated
 *       403:
 *         description: Forbidden
 */
router.put("/:id", auth_middleware_1.verifyJWT, auth_middleware_1.checkActiveUser, upload_middleware_1.upload.fields([
    { name: "image", maxCount: 1 },
    { name: "bannerImage", maxCount: 1 },
]), (0, validate_middleware_1.validate)(serviceType_validation_1.updateValidation), serviceTypeController.update);
/**
 * @swagger
 * /api/service-types/{id}:
 *   delete:
 *     summary: Delete a service type (Admin only)
 *     tags: [ServiceTypes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Deleted
 *       403:
 *         description: Forbidden
 */
router.delete("/:id", auth_middleware_1.verifyJWT, auth_middleware_1.checkActiveUser, serviceTypeController.remove);
exports.default = router;
