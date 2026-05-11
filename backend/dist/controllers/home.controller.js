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
exports.searchServices = exports.getAllServices = exports.getPopularServices = exports.getServiceTypes = void 0;
const logger_1 = __importDefault(require("../utils/logger"));
const home = __importStar(require("../services/home.service"));
const common_utils_1 = require("../utils/common.utils");
const response_util_1 = require("../utils/response.util");
const messages_1 = require("../constants/messages");
const getServiceTypes = (_req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = yield home.getServiceTypesPublic();
        return (0, response_util_1.sendResponse)(res, messages_1.MESSAGES.SERVICE_TYPE.FETCHED, data);
    }
    catch (err) {
        logger_1.default.error((0, common_utils_1.getErrorMessage)(err));
        next(err);
    }
});
exports.getServiceTypes = getServiceTypes;
const getPopularServices = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const limit = (_a = (0, common_utils_1.parseNumber)(req.query.limit)) !== null && _a !== void 0 ? _a : 10;
        const data = yield home.getPopularServicesPublic({ limit });
        return (0, response_util_1.sendResponse)(res, messages_1.MESSAGES.SERVICE.POPULAR_FETCHED, data);
    }
    catch (err) {
        logger_1.default.error((0, common_utils_1.getErrorMessage)(err));
        next(err);
    }
});
exports.getPopularServices = getPopularServices;
const getAllServices = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const limit = (_a = (0, common_utils_1.parseNumber)(req.query.limit)) !== null && _a !== void 0 ? _a : 12;
        const data = yield home.getAllServicesPublic({ limit });
        return (0, response_util_1.sendResponse)(res, messages_1.MESSAGES.SERVICE.ALL_FETCHED, data);
    }
    catch (err) {
        logger_1.default.error((0, common_utils_1.getErrorMessage)(err));
        next(err);
    }
});
exports.getAllServices = getAllServices;
const searchServices = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const q = typeof req.query.q === "string" ? req.query.q : "";
        const limit = (_a = (0, common_utils_1.parseNumber)(req.query.limit)) !== null && _a !== void 0 ? _a : 12;
        const data = yield home.searchServicesPublic({ q, limit });
        return (0, response_util_1.sendResponse)(res, messages_1.MESSAGES.SERVICE.SEARCHED, data);
    }
    catch (err) {
        logger_1.default.error((0, common_utils_1.getErrorMessage)(err));
        next(err);
    }
});
exports.searchServices = searchServices;
