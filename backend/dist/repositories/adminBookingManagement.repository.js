"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminBookingManagementRepository = void 0;
const sequelize_1 = require("sequelize");
const models_1 = require("../models");
exports.adminBookingManagementRepository = {
    // ================= GROUPED BOOKINGS =================
    getGroupedBookings: (_a) => __awaiter(void 0, [_a], void 0, function* ({ where, include, groupBy, having, orderExpr, sortOrder, limit, offset, attributes, }) {
        return models_1.Booking.findAll({
            where,
            include,
            attributes,
            group: groupBy,
            having,
            order: [[orderExpr, sortOrder]],
            limit,
            offset,
            subQuery: false,
            raw: true,
        });
    }),
    countGroupedBookings: (_a) => __awaiter(void 0, [_a], void 0, function* ({ where, include, groupBy, having, }) {
        const result = yield models_1.Booking.count({
            where,
            include,
            group: groupBy,
            having,
            subQuery: false,
        });
        return Array.isArray(result) ? result.length : Number(result);
    }),
    // ================= DETAILS =================
    getBookingDetails: (groupOr, serviceType, paymentMethod) => {
        return models_1.Booking.findAll({
            where: { [sequelize_1.Op.or]: groupOr },
            attributes: [
                "id",
                "serviceId",
                "serviceTypeId",
                "userId",
                "servicePartnerId",
                "bookingDate",
                "serviceAddress",
                "status",
                [(0, sequelize_1.fn)("DATE", (0, sequelize_1.col)("Booking.booking_date")), "group_date"],
            ],
            include: [
                {
                    model: models_1.Service,
                    as: "service",
                    attributes: ["id", "name"],
                },
                {
                    model: models_1.ServiceType,
                    as: "serviceType",
                    attributes: ["id", "name"],
                    required: Boolean(serviceType),
                    where: serviceType
                        ? { name: { [sequelize_1.Op.iLike]: serviceType } }
                        : undefined,
                },
                {
                    model: models_1.ServicePartner,
                    as: "servicePartner",
                    attributes: ["id"],
                    include: [
                        {
                            model: models_1.User,
                            as: "user",
                            attributes: ["id", "name", "mobileNumber", "profileImage"],
                        },
                    ],
                },
                {
                    model: models_1.Payment,
                    as: "payment",
                    attributes: [],
                    required: Boolean(paymentMethod),
                    where: paymentMethod ? { paymentMethod } : undefined,
                },
            ],
            order: [
                ["userId", "ASC"],
                ["bookingDate", "DESC"],
                ["id", "ASC"],
            ],
            raw: true,
            nest: true,
        });
    },
    getAdminBookingDetailsById: (id) => models_1.Booking.findByPk(id, {
        attributes: [
            "id",
            "serviceId",
            "serviceTypeId",
            "userId",
            "servicePartnerId",
            "bookingDate",
            "status",
            "amount",
            "cancellationReason",
            "createdAt",
        ],
        include: [
            {
                model: models_1.Service,
                as: "service",
                attributes: ["id", "name", "commission"],
            },
            {
                model: models_1.ServiceType,
                as: "serviceType",
                attributes: ["id", "name"],
                required: false,
            },
            {
                model: models_1.User,
                as: "customer",
                attributes: ["id", "name", "email", "mobileNumber", "profileImage"],
                required: false,
            },
            {
                model: models_1.ServicePartner,
                as: "servicePartner",
                attributes: ["id"],
                required: false,
                include: [
                    {
                        model: models_1.User,
                        as: "user",
                        attributes: [
                            "id",
                            "name",
                            "email",
                            "mobileNumber",
                            "profileImage",
                        ],
                        required: false,
                    },
                ],
            },
            {
                model: models_1.Payment,
                as: "payment",
                attributes: [
                    "id",
                    "amount",
                    "tax",
                    "discount",
                    "totalAmount",
                    "currency",
                    "paymentMethod",
                    "paymentStatus",
                    "paymentGateway",
                    "orderId",
                    "sessionId",
                    "paymentIntentId",
                    "paidAt",
                ],
                required: false,
            },
        ],
    }),
    // ================= BASIC =================
    findBookingById: (id) => models_1.Booking.findByPk(id, {
        include: [
            {
                model: models_1.Payment,
                as: "payment",
                attributes: [
                    "id",
                    "amount",
                    "tax",
                    "paymentMethod",
                    "paymentStatus",
                    "paymentIntentId",
                    "orderId",
                    "sessionId",
                ],
                required: false,
            },
        ],
    }),
    deleteBooking: (id) => models_1.Booking.destroy({ where: { id } }),
    updateBooking: (booking, payload) => booking.update(payload),
    updatePayment: (where, payload) => models_1.Payment.update(payload, { where }),
    // ================= EXPERT =================
    findServicePartnerWithUser: (id) => models_1.ServicePartner.findByPk(id, {
        include: [
            { model: models_1.User, as: "user", attributes: ["id", "name", "email"] },
        ],
    }),
    findServiceByIdWithRelations: (id) => models_1.Service.findByPk(id, {
        attributes: ["id", "categoryId", "subCategoryId"],
        include: [
            {
                model: models_1.SubCategory,
                as: "subCategory",
                include: [
                    {
                        model: models_1.Category,
                        as: "category",
                        include: [
                            { model: models_1.ServiceType, as: "serviceType", attributes: ["id"] },
                        ],
                    },
                ],
            },
        ],
    }),
    findCategoryWithServiceType: (id) => models_1.Category.findByPk(id, {
        include: [{ model: models_1.ServiceType, as: "serviceType", attributes: ["id"] }],
    }),
    // ================= FILTER =================
    getServiceTypes: () => models_1.ServiceType.findAll({
        attributes: ["name"],
        order: [["name", "ASC"]],
        raw: true,
    }),
    findServiceTypeByName: (name) => models_1.ServiceType.findOne({
        where: { name: { [sequelize_1.Op.iLike]: name } },
    }),
    findExpertsByServiceType: (serviceTypeId, verificationStatus, status) => models_1.ServicePartner.findAll({
        where: {
            serviceTypeId,
            verificationStatus,
            status,
        },
        include: [
            {
                model: models_1.User,
                as: "user",
                attributes: ["id", "name", "email", "isActive", "profileImage"],
            },
        ],
    }),
};
