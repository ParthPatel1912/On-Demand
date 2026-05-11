"use strict";
// src/controllers/log.controller.ts
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
exports.getEventTypesOfLog = exports.getLogs = void 0;
const asyncErrorHandler_1 = __importDefault(require("../utils/asyncErrorHandler"));
const response_util_1 = require("../utils/response.util");
const logger_service_1 = require("../services/logger.service");
const messages_1 = require("../constants/messages");
exports.getLogs = (0, asyncErrorHandler_1.default)((req, res, _next) => __awaiter(void 0, void 0, void 0, function* () {
    const logs = yield (0, logger_service_1.getLogsService)(req.query);
    return (0, response_util_1.sendResponse)(res, {
        data: logs.data,
        pagination: logs.pagination,
        message: messages_1.MESSAGES.COMMON.LOGS_FETCHED,
    });
}));
exports.getEventTypesOfLog = (0, asyncErrorHandler_1.default)((req, res, _next) => __awaiter(void 0, void 0, void 0, function* () {
    const { category } = req.query;
    const eventTypes = yield (0, logger_service_1.getEventTypesOfLogService)(category);
    return (0, response_util_1.sendResponse)(res, messages_1.MESSAGES.EXPERT.EVENT_TYPES_FETCHED, eventTypes);
}));
