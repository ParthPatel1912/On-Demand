"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const logger_1 = __importDefault(require("../utils/logger"));
const response_util_1 = require("../utils/response.util");
const messages_1 = require("../constants/messages");
const enums_1 = require("../enums");
const errorHandler = (err, req, res, next) => {
    var _a;
    logger_1.default.error(`${req.method} ${req.url} - ${err.message}`);
    // Handle Joi validation errors
    if (err.isJoi || err.details) {
        const errors = {};
        (_a = err.details) === null || _a === void 0 ? void 0 : _a.forEach((detail) => {
            const errorKey = detail.path[0].toString();
            if (!errors[errorKey]) {
                errors[errorKey] = [];
            }
            const cleanMessage = detail.message.replace(/"/g, "");
            errors[errorKey].push(cleanMessage);
        });
        return (0, response_util_1.sendError)(res, messages_1.MESSAGES.COMMON.VALIDATION_FAILED, enums_1.STATUS_CODE.BAD_REQUEST, { errors });
    }
    (0, response_util_1.sendError)(res, err.message || messages_1.MESSAGES.COMMON.INTERNAL_SERVER_ERROR, err.statusCode || enums_1.STATUS_CODE.INTERNAL_SERVER_ERROR);
};
exports.errorHandler = errorHandler;
