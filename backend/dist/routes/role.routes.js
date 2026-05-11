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
const roleController = __importStar(require("../controllers/role.controller"));
const auth_middleware_1 = require("../middlewares/auth.middleware");
const validate_middleware_1 = require("../middlewares/validate.middleware");
const role_validation_1 = require("../validations/role.validation");
const userRole_enum_1 = require("../enums/userRole.enum");
const router = (0, express_1.Router)();
/**
 * @swagger
 * tags:
 *   name: Roles
 *   description: Role management and access control. Authentication is applied globally.
 */
/**
 * @swagger
 * components:
 *   schemas:
 *     RoleResponse:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         name:
 *           type: string
 *         description:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     RolePayload:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         name:
 *           type: string
 *           example: "editor"
 *         description:
 *           type: string
 *           example: "User with editorial permissions"
 */
/**
 * @swagger
 * /api/roles:
 *   get:
 *     summary: List all roles
 *     description: Retrieve a list of roles with optional filtering and sorting.
 *     tags: [Roles]
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by name or description
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *         description: Attribute to sort by
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [ASC, DESC]
 *         description: Sort direction
 *     responses:
 *       200:
 *         description: Success
 */
router.get("/", auth_middleware_1.verifyJWT, auth_middleware_1.checkActiveUser, (0, auth_middleware_1.authorizeRoles)(userRole_enum_1.UserRole.SUPER_ADMIN), roleController.listRoles);
/**
 * @swagger
 * /api/roles:
 *   post:
 *     summary: Create a role
 *     tags: [Roles]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RolePayload'
 *     responses:
 *       201:
 *         description: Role created
 */
router.post("/", auth_middleware_1.verifyJWT, auth_middleware_1.checkActiveUser, (0, auth_middleware_1.authorizeRoles)(userRole_enum_1.UserRole.SUPER_ADMIN), (0, validate_middleware_1.validate)(role_validation_1.createRoleSchema), roleController.createRole);
/**
 * @swagger
 * /api/roles/{id}:
 *   put:
 *     summary: Update a role
 *     tags: [Roles]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RolePayload'
 *     responses:
 *       200:
 *         description: Role updated
 */
router.put("/:id", auth_middleware_1.verifyJWT, auth_middleware_1.checkActiveUser, (0, auth_middleware_1.authorizeRoles)(userRole_enum_1.UserRole.SUPER_ADMIN), (0, validate_middleware_1.validate)(role_validation_1.updateRoleSchema), roleController.updateRole);
/**
 * @swagger
 * /api/roles/{id}:
 *   delete:
 *     summary: Delete a role
 *     tags: [Roles]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Role deleted
 */
router.delete("/:id", auth_middleware_1.verifyJWT, auth_middleware_1.checkActiveUser, (0, auth_middleware_1.authorizeRoles)(userRole_enum_1.UserRole.SUPER_ADMIN), roleController.deleteRole);
exports.default = router;
