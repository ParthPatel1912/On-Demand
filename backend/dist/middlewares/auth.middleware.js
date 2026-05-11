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
exports.authorizeRoles = exports.verifyJWT = void 0;
exports.checkActiveUser = checkActiveUser;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const apiError_util_1 = require("../utils/apiError.util");
const logger_1 = __importDefault(require("../utils/logger"));
const user_model_1 = __importDefault(require("../models/user.model"));
const userRole_enum_1 = require("../enums/userRole.enum");
const response_util_1 = require("../utils/response.util");
const role_model_1 = __importDefault(require("../models/role.model"));
const enums_1 = require("../enums");
const messages_1 = require("../constants/messages");
const auth_messages_1 = require("../constants/messages/auth.messages");
const verifyJWT = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization || req.headers.Authorization;
        if (!(authHeader === null || authHeader === void 0 ? void 0 : authHeader.toString().startsWith("Bearer "))) {
            logger_1.default.warn("Unauthorized request: Missing or invalid token format");
            return next(new apiError_util_1.ApiError(enums_1.STATUS_CODE.UNAUTHORIZED, auth_messages_1.AUTH.TOKEN_MISSING_BEARER_FORMAT));
        }
        const token = authHeader.toString().split(" ")[1];
        const secret = process.env.JWT_SECRET;
        if (!secret) {
            logger_1.default.error("JWT_SECRET is not defined in environment variables");
            return next(new apiError_util_1.ApiError(enums_1.STATUS_CODE.INTERNAL_SERVER_ERROR, auth_messages_1.AUTH.JWT_SECRET_MISSING));
        }
        jsonwebtoken_1.default.verify(token, secret, { algorithms: ["HS256"] }, (err, decoded) => {
            if (err) {
                logger_1.default.warn(`Token verification failed: ${err.message}`);
                return next(new apiError_util_1.ApiError(enums_1.STATUS_CODE.FORBIDDEN, auth_messages_1.AUTH.FORBIDDEN));
            }
            req.user = decoded;
            next();
        });
    }
    catch (error) {
        next(error);
    }
};
exports.verifyJWT = verifyJWT;
function checkActiveUser(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c;
        try {
            // 1. Verify user ID claim
            const userId = ((_a = req.user) === null || _a === void 0 ? void 0 : _a.id) || ((_b = req.user) === null || _b === void 0 ? void 0 : _b.sub);
            if (!userId) {
                return (0, response_util_1.sendError)(res, messages_1.MESSAGES.AUTH.INVALID_TOKEN_MISSING_USER_ID, enums_1.STATUS_CODE.UNAUTHORIZED);
            }
            // 2. Single DB call against the unified `users` table, pulling the Role definition too
            const userRecord = yield user_model_1.default.findByPk(userId, {
                attributes: ['id', 'isActive', 'roleId'],
                include: [
                    {
                        model: role_model_1.default,
                        as: 'role',
                        attributes: ['name']
                    }
                ],
            });
            if (!userRecord) {
                return (0, response_util_1.sendError)(res, messages_1.MESSAGES.USER.NOT_FOUND, enums_1.STATUS_CODE.NOT_FOUND);
            }
            // 3. Status checks
            if (userRecord.isActive === false) {
                return (0, response_util_1.sendError)(res, messages_1.MESSAGES.AUTH.ACCOUNT_INACTIVE_CONTACT_SUPPORT, enums_1.STATUS_CODE.FORBIDDEN);
            }
            // 4. Attach role explicitly derived from the Role mapping
            req.user.role = ((_c = userRecord.role) === null || _c === void 0 ? void 0 : _c.name) || userRole_enum_1.UserRole.CUSTOMER;
            next();
        }
        catch (error) {
            logger_1.default.error('checkActiveUser error:', error);
            return (0, response_util_1.sendError)(res, messages_1.MESSAGES.COMMON.INTERNAL_SERVER_ERROR, enums_1.STATUS_CODE.INTERNAL_SERVER_ERROR);
        }
    });
}
/**
 * Middleware to authorize specific roles.
 * Must be used after verifyJWT and checkActiveUser.
 */
const authorizeRoles = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user || !allowedRoles.includes(req.user.role)) {
            return next(new apiError_util_1.ApiError(enums_1.STATUS_CODE.FORBIDDEN, messages_1.MESSAGES.AUTH.FORBIDDEN_ROLE));
        }
        next();
    };
};
exports.authorizeRoles = authorizeRoles;
