"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyCustomerJWT = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const apiError_util_1 = require("../utils/apiError.util");
const logger_1 = __importDefault(require("../utils/logger"));
const enums_1 = require("../enums");
const messages_1 = require("../constants/messages");
/**
 * Middleware to verify customer JWT tokens.
 * Used on protected customer routes (e.g. /me, address, bookings).
 */
const verifyCustomerJWT = (req, res, next) => {
    var _a;
    try {
        const authHeader = (_a = req.headers.authorization) !== null && _a !== void 0 ? _a : req.headers["Authorization"];
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            logger_1.default.warn("CustomerAuth: Missing or malformed Authorization header");
            throw new apiError_util_1.ApiError(enums_1.STATUS_CODE.UNAUTHORIZED, messages_1.MESSAGES.AUTH.UNAUTHORIZED);
        }
        const token = authHeader.split(" ")[1];
        const secret = process.env.JWT_SECRET;
        if (!secret) {
            logger_1.default.error("CustomerAuth: JWT_SECRET is not defined");
            throw new apiError_util_1.ApiError(enums_1.STATUS_CODE.INTERNAL_SERVER_ERROR, messages_1.MESSAGES.AUTH.JWT_SECRET_MISSING);
        }
        const decoded = jsonwebtoken_1.default.verify(token, secret);
        req.customer = decoded;
        next();
    }
    catch (error) {
        if (error instanceof apiError_util_1.ApiError) {
            next(error);
            return;
        }
        logger_1.default.warn(`CustomerAuth: Token verification failed`);
        next(new apiError_util_1.ApiError(enums_1.STATUS_CODE.UNAUTHORIZED, messages_1.MESSAGES.AUTH.INVALID_OR_EXPIRED_TOKEN));
    }
};
exports.verifyCustomerJWT = verifyCustomerJWT;
