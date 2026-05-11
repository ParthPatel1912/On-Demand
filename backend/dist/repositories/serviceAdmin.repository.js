"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.serviceAdminRepository = void 0;
const sequelize_1 = require("sequelize");
const models_1 = require("../models");
exports.serviceAdminRepository = {
    // ================= LIST =================
    listServicesByCategory: (where, limit, offset) => {
        return models_1.Service.findAndCountAll({
            where,
            include: [
                {
                    model: models_1.SubCategory,
                    as: "subCategory",
                    required: true,
                    include: [{ model: models_1.Category, as: "category", required: true }],
                },
            ],
            order: [["createdAt", "DESC"], ["id", "DESC"]],
            limit,
            offset,
        });
    },
    // ================= GET =================
    getServiceById: (id) => {
        return models_1.Service.findByPk(id, {
            include: [
                {
                    model: models_1.SubCategory,
                    as: "subCategory",
                    include: [
                        {
                            model: models_1.Category,
                            as: "category",
                            include: [
                                {
                                    model: models_1.ServiceType,
                                    as: "serviceType",
                                    attributes: ["id", "name"],
                                },
                            ],
                        },
                    ],
                },
            ],
        });
    },
    // ================= CATEGORY =================
    getCategoryById: (id) => models_1.Category.findByPk(id),
    getSubCategoryById: (id) => models_1.SubCategory.findByPk(id),
    // ================= DUPLICATE CHECK =================
    findDuplicateService: (categoryId, subCategoryId, name, excludeId) => {
        return models_1.Service.findOne({
            where: Object.assign(Object.assign({}, (excludeId ? { id: { [sequelize_1.Op.ne]: excludeId } } : {})), { categoryId,
                subCategoryId, name: { [sequelize_1.Op.iLike]: name } }),
        });
    },
    // ================= CREATE =================
    createService: (payload) => models_1.Service.create(payload),
    // ================= UPDATE =================
    getServiceEntity: (id) => models_1.Service.findByPk(id),
    updateService: (item, payload) => item.update(payload),
    // ================= DELETE =================
    deleteService: (item) => item.destroy(),
};
