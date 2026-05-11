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
const categoryController = __importStar(require("../controllers/category.controller"));
const validate_middleware_1 = require("../middlewares/validate.middleware");
const category_validation_1 = require("../validations/category.validation");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const dataParser_middleware_1 = require("../middlewares/dataParser.middleware");
const upload_middleware_1 = require("../middlewares/upload.middleware");
const router = (0, express_1.Router)();
/**
 * @swagger
 * /api/service-types/{serviceTypeId}/categories:
 *   get:
 *     summary: Get categories by service type
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: serviceTypeId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The service type ID
 *     responses:
 *       200:
 *         description: List of categories
 *       404:
 *         description: Service type not found
 */
/**
 * @swagger
 * /api/categories/by-service-types:
 *   get:
 *     summary: Get categories by multiple service type IDs
 *     tags: [Categories]
 *     parameters:
 *       - in: query
 *         name: ids
 *         required: true
 *         schema:
 *           type: string
 *         description: Comma-separated service type IDs (e.g. "1,2,3")
 *       - in: query
 *         name: excludeEmpty
 *         schema:
 *           type: boolean
 *         description: Exclude categories with no subcategories
 *     responses:
 *       200:
 *         description: Merged list of categories for all given service types
 *       400:
 *         description: Missing or invalid ids parameter
 */
router.get("/categories/by-service-types", categoryController.getCategoriesMultiple);
router.get("/service-types/:serviceTypeId/categories", categoryController.getCategories);
router.post("/service-types/:serviceTypeId/categories", auth_middleware_1.verifyJWT, auth_middleware_1.checkActiveUser, upload_middleware_1.imageUpload.single("image"), (0, validate_middleware_1.validate)(category_validation_1.createValidation), categoryController.createCategory);
router.post("/service-types/:serviceTypeId/categories/bulk", auth_middleware_1.verifyJWT, auth_middleware_1.checkActiveUser, upload_middleware_1.imageUpload.any(), (0, dataParser_middleware_1.parseBodyJson)("categories"), (0, validate_middleware_1.validate)(category_validation_1.bulkCreateValidation), categoryController.bulkCreate);
/**
 * @swagger
 * /api/categories/{id}:
 *   delete:
 *     summary: Delete a category
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The category ID
 *     responses:
 *       200:
 *         description: Category deleted successfully
 *       404:
 *         description: Category not found
 */
router.delete("/categories/:id", auth_middleware_1.verifyJWT, auth_middleware_1.checkActiveUser, categoryController.deleteCategory);
exports.default = router;
