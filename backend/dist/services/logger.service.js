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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEventTypesOfLogService = exports.getLogsService = exports.logEvent = void 0;
const logger_1 = __importDefault(require("../utils/logger"));
const socket_1 = require("../socket");
const sequelize_1 = require("sequelize");
const common_utils_1 = require("../utils/common.utils");
const logger_repository_1 = require("../repositories/logger.repository");
const buildLogWhereClause = (query) => {
    const where = {};
    if (query.eventType) {
        where.eventType = query.eventType;
    }
    if (query.category) {
        where.category = query.category;
    }
    if (query.status) {
        where.status = query.status;
    }
    if (query.userId && !Number.isNaN(Number(query.userId))) {
        where.userId = Number(query.userId);
    }
    if (query.serviceId && !Number.isNaN(Number(query.serviceId))) {
        where.serviceId = Number(query.serviceId);
    }
    if (query.bookingId && !Number.isNaN(Number(query.bookingId))) {
        where.bookingId = Number(query.bookingId);
    }
    if (typeof query.search === "string" && query.search.trim()) {
        const q = query.search.trim();
        where[sequelize_1.Op.or] = [
            { message: { [sequelize_1.Op.iLike]: `%${q}%` } },
            { eventType: { [sequelize_1.Op.iLike]: `%${q}%` } },
        ];
    }
    if (query.fromDate || query.toDate) {
        const createdAtFilter = {};
        if (query.fromDate) {
            const from = new Date(query.fromDate);
            if (from && !isNaN(from.getTime())) {
                from.setHours(0, 0, 0, 0);
                createdAtFilter[sequelize_1.Op.gte] = from;
            }
        }
        if (query.toDate) {
            const to = new Date(query.toDate);
            if (to && !isNaN(to.getTime())) {
                to.setHours(23, 59, 59, 999);
                createdAtFilter[sequelize_1.Op.lte] = to;
            }
        }
        if (createdAtFilter[sequelize_1.Op.gte] || createdAtFilter[sequelize_1.Op.lte]) {
            where.createdAt = createdAtFilter;
        }
    }
    return where;
};
const logEvent = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        logger_1.default.info(payload.message);
        const log = yield (0, logger_repository_1.createLogEvent)(payload);
        if (socket_1.io) {
            (_a = socket_1.io.to("ADMIN")) === null || _a === void 0 ? void 0 : _a.emit("LOG_CREATED", log);
        }
        return log;
    }
    catch (error) {
        logger_1.default.error("Logger error", { error, payload });
        throw error;
    }
});
exports.logEvent = logEvent;
const getLogsService = (query) => __awaiter(void 0, void 0, void 0, function* () {
    const where = buildLogWhereClause(query);
    const limit = Math.min(Number(query.limit) || 10, 100);
    const page = Math.max(Number(query.page) || 1, 1);
    const sortBy = query.sortBy || "createdAt";
    const sortOrder = query.sortOrder || "DESC";
    const options = {
        where,
        order: [[sortBy, sortOrder]],
        limit,
        offset: (page - 1) * limit,
        raw: true,
    };
    const { rows: data, count: totalItems } = yield (0, logger_repository_1.findAndCountAllLogs)(options);
    return {
        data,
        pagination: {
            totalItems,
            currentPage: page,
            totalPages: Math.ceil(totalItems / limit),
            limit,
        },
    };
});
exports.getLogsService = getLogsService;
const getEventTypesOfLogService = (category) => __awaiter(void 0, void 0, void 0, function* () {
    const where = category ? { category } : {};
    const rows = yield (0, logger_repository_1.findEventTypesCount)(where);
    return rows.map((row) => ({
        value: row.eventType,
        label: (0, common_utils_1.humanizeString)(row.eventType),
    }));
});
exports.getEventTypesOfLogService = getEventTypesOfLogService;
