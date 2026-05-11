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
const subCategoryController = __importStar(require("../controllers/subCategory.controller"));
const validate_middleware_1 = require("../middlewares/validate.middleware");
const subCategory_validation_1 = require("../validations/subCategory.validation");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const upload_middleware_1 = require("../middlewares/upload.middleware");
const router = (0, express_1.Router)();
router.get("/categories/:categoryId/subcategories", auth_middleware_1.verifyJWT, auth_middleware_1.checkActiveUser, subCategoryController.getSubCategories);
router.post("/categories/:categoryId/subcategories", auth_middleware_1.verifyJWT, auth_middleware_1.checkActiveUser, upload_middleware_1.imageUpload.single("image"), (0, validate_middleware_1.validate)(subCategory_validation_1.createValidation), subCategoryController.createSubCategory);
/**
 * @swagger
 * /api/subcategories/{id}:
 *   delete:
 *     summary: Delete a sub-category
 *     tags: [SubCategories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The sub-category ID
 *     responses:
 *       200:
 *         description: Sub-category deleted successfully
 */
router.delete("/subcategories/:id", auth_middleware_1.verifyJWT, auth_middleware_1.checkActiveUser, subCategoryController.deleteSubCategory);
exports.default = router;
