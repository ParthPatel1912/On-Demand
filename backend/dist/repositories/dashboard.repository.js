"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dashboardRepository = void 0;
const sequelize_1 = require("sequelize");
const models_1 = require("../models");
const transaction_enum_1 = require("../enums/transaction.enum");
exports.dashboardRepository = {
    // ================= ADMIN DASHBOARD =================
    getBookingsWithRelations: (start, end) => {
        return models_1.Booking.findAll({
            where: {
                status: transaction_enum_1.BookingStatus.COMPLETED,
                createdAt: { [sequelize_1.Op.between]: [start, end] },
            },
            include: [
                {
                    model: models_1.Service,
                    as: "service",
                    attributes: ["id", "name"],
                    required: false,
                },
                {
                    model: models_1.ServiceType,
                    as: "serviceType",
                    attributes: ["id", "name"],
                    required: false,
                },
                {
                    model: models_1.ServicePartner,
                    as: "servicePartner",
                    attributes: ["id", "residentialAddress", "permanentAddress"],
                },
            ],
            attributes: [
                "id",
                "createdAt",
                "userId",
                "servicePartnerId",
                "serviceId",
                "amount",
            ],
        });
    },
    countCompletedBookings: () => models_1.Booking.count({ where: { status: transaction_enum_1.BookingStatus.COMPLETED } }),
    sumRevenue: (where = {}) => models_1.Booking.sum("amount", {
        where: Object.assign({ status: transaction_enum_1.BookingStatus.COMPLETED }, where),
    }),
    countUsers: (where) => models_1.User.count({ where }),
    countPartners: (where = {}) => models_1.ServicePartner.count({ where }),
    countBookings: (where) => models_1.Booking.count({ where }),
    getTopPartnersRaw: () => models_1.Booking.findAll({
        attributes: [
            "servicePartnerId",
            [(0, sequelize_1.fn)("COUNT", (0, sequelize_1.col)("id")), "bookingCount"],
        ],
        where: {
            status: transaction_enum_1.BookingStatus.COMPLETED,
            servicePartnerId: { [sequelize_1.Op.ne]: null },
        },
        group: ["servicePartnerId"],
        order: [[(0, sequelize_1.fn)("COUNT", (0, sequelize_1.col)("id")), "DESC"]],
        limit: 5,
        raw: true,
    }),
    getPartnersWithUsers: (ids) => {
        if (!ids.length)
            return [];
        return models_1.ServicePartner.findAll({
            where: { id: { [sequelize_1.Op.in]: ids } },
            include: [
                { model: models_1.User, as: "user", attributes: ["name", "profileImage"] },
            ],
            attributes: ["id"],
        });
    },
    // ================= PARTNER DASHBOARD =================
    getPartnerSubCategories: (partnerId) => models_1.ServicePartnerService.findAll({
        where: { partnerId },
        attributes: ["subCategoryId"],
    }),
    countServicesBySubCategories: (subCategoryIds) => {
        if (!subCategoryIds.length)
            return 0;
        return models_1.Service.count({
            where: {
                subCategoryId: { [sequelize_1.Op.in]: subCategoryIds },
                availability: true,
            },
        });
    },
    getPartnerBookings: (partnerId, start, end) => {
        return models_1.Booking.findAll({
            where: {
                servicePartnerId: partnerId,
                status: transaction_enum_1.BookingStatus.COMPLETED,
                createdAt: { [sequelize_1.Op.between]: [start, end] },
            },
            include: [{ model: models_1.Service, as: "service", attributes: ["id", "name"] }],
            attributes: ["id", "createdAt", "amount", "serviceId"],
        });
    },
};
