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
exports.serviceRepository = void 0;
const sequelize_1 = require("sequelize");
const models_1 = require("../models");
const transaction_enum_1 = require("../enums/transaction.enum");
exports.serviceRepository = {
    // Service Types
    getServiceTypes: () => __awaiter(void 0, void 0, void 0, function* () {
        return models_1.ServiceType.findAll({
            attributes: ["id", "name", "image"],
            order: [["createdAt", "DESC"]],
        });
    }),
    // Booking counts grouped
    getPopularServiceIds: (limit) => __awaiter(void 0, void 0, void 0, function* () {
        return (yield models_1.Booking.findAll({
            attributes: ["serviceId", [(0, sequelize_1.fn)("COUNT", (0, sequelize_1.col)("id")), "bookingCount"]],
            where: {
                status: {
                    [sequelize_1.Op.in]: [transaction_enum_1.BookingStatus.CONFIRMED, transaction_enum_1.BookingStatus.COMPLETED],
                },
            },
            group: ["serviceId"],
            order: [[(0, sequelize_1.fn)("COUNT", (0, sequelize_1.col)("id")), "DESC"]],
            limit,
            raw: true,
        }));
    }),
    // Services by IDs
    getServicesByIds: (ids) => __awaiter(void 0, void 0, void 0, function* () {
        if (!ids.length)
            return [];
        return models_1.Service.findAll({
            where: {
                availability: true,
                id: { [sequelize_1.Op.in]: ids },
            },
            attributes: ["id", "name", "price", "images"],
        });
    }),
    // Latest services (fallback or all)
    getLatestServices: (limit_1, ...args_1) => __awaiter(void 0, [limit_1, ...args_1], void 0, function* (limit, excludeIds = []) {
        return models_1.Service.findAll({
            where: Object.assign({ availability: true }, (excludeIds.length ? { id: { [sequelize_1.Op.notIn]: excludeIds } } : {})),
            attributes: ["id", "name", "price", "images"],
            order: [["createdAt", "DESC"]],
            limit,
        });
    }),
    // Search
    searchServices: (query, limit) => __awaiter(void 0, void 0, void 0, function* () {
        return models_1.Service.findAll({
            where: {
                availability: true,
                name: { [sequelize_1.Op.iLike]: `%${query}%` },
            },
            attributes: ["id", "name", "price", "images"],
            order: [["createdAt", "DESC"]],
            limit,
        });
    }),
};
