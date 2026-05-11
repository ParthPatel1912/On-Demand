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
exports.getServicePartnerDashboardController = exports.getDashboardOverview = void 0;
const logger_1 = __importDefault(require("../utils/logger"));
const dashboard_service_1 = require("../services/dashboard.service");
const servicePartnerRepository = __importStar(require("../repositories/servicePartner.repository"));
const response_util_1 = require("../utils/response.util");
const common_utils_1 = require("../utils/common.utils");
const messages_1 = require("../constants/messages");
const enums_1 = require("../enums");
const getDashboardOverview = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        logger_1.default.info(`Fetching dashboard overview data from DB.`);
        const data = yield (0, dashboard_service_1.getDashboardOverviewOptimized)();
        return (0, response_util_1.sendResponse)(res, undefined, data);
    }
    catch (err) {
        logger_1.default.error((0, common_utils_1.getErrorMessage)(err));
        next(err);
    }
});
exports.getDashboardOverview = getDashboardOverview;
/**
 * Service Partner Dashboard Controller
 */
const getServicePartnerDashboardController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.sub;
        if (!userId) {
            return (0, response_util_1.sendError)(res, messages_1.MESSAGES.EXPERT.UNAUTHORIZED, enums_1.STATUS_CODE.UNAUTHORIZED);
        }
        const servicePartnerId = yield servicePartnerRepository.findServicePartnerByUserId(userId);
        if (!servicePartnerId) {
            return (0, response_util_1.sendError)(res, messages_1.MESSAGES.EXPERT.UNAUTHORIZED, enums_1.STATUS_CODE.UNAUTHORIZED);
        }
        const data = yield (0, dashboard_service_1.getServicePartnerDashboardOptimized)(+servicePartnerId.id);
        return (0, response_util_1.sendResponse)(res, messages_1.MESSAGES.DASHBOARD.FETCHED, data);
    }
    catch (error) {
        logger_1.default.error("Dashboard Error:", error);
        return (0, response_util_1.sendError)(res, messages_1.MESSAGES.COMMON.SOMETHING_WENT_WRONG);
    }
});
exports.getServicePartnerDashboardController = getServicePartnerDashboardController;
