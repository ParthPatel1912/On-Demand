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
exports.searchServicesPublic = exports.getAllServicesPublic = exports.getPopularServicesPublic = exports.getServiceTypesPublic = void 0;
const logger_1 = __importDefault(require("../utils/logger"));
const service_repository_1 = require("../repositories/service.repository");
/**
 * @name getServiceTypesPublic
 * @description Returns service types for the public home page.
 * @access Private
 */
const getServiceTypesPublic = () => __awaiter(void 0, void 0, void 0, function* () {
    logger_1.default.info("[DB] getServiceTypesPublic CALLED");
    const serviceTypes = yield service_repository_1.serviceRepository.getServiceTypes();
    return serviceTypes.map((st) => {
        var _a;
        return ({
            id: st.id,
            name: st.name,
            image: (_a = st.image) !== null && _a !== void 0 ? _a : "",
        });
    });
});
exports.getServiceTypesPublic = getServiceTypesPublic;
/**
 * @name getPopularServicesPublic
 * @description Returns popular services based on booking counts with a fallback to newest services to fill remaining slots.
 * @access Private
 */
const getPopularServicesPublic = (_a) => __awaiter(void 0, [_a], void 0, function* ({ limit, }) {
    logger_1.default.info("[DB] getPopularServicesPublic CALLED");
    const effectiveLimit = Math.min(50, Math.max(1, limit !== null && limit !== void 0 ? limit : 10));
    const bookingCounts = yield service_repository_1.serviceRepository.getPopularServiceIds(effectiveLimit);
    const popularServiceIds = bookingCounts
        .map((row) => Number(row.serviceId))
        .filter((id) => Number.isFinite(id));
    const popularServices = yield service_repository_1.serviceRepository.getServicesByIds(popularServiceIds);
    const byId = new Map(popularServices.map((s) => [s.id, s]));
    const orderedPopular = popularServiceIds
        .map((id) => byId.get(id))
        .filter((s) => Boolean(s));
    const remaining = Math.max(0, effectiveLimit - orderedPopular.length);
    const fallbackRows = remaining > 0
        ? yield service_repository_1.serviceRepository.getLatestServices(remaining, popularServiceIds)
        : [];
    const rows = [...orderedPopular, ...fallbackRows];
    return rows.map((s) => {
        var _a, _b;
        return ({
            id: s.id,
            name: s.name,
            price: String(s.price),
            image: ((_b = (_a = s.images) === null || _a === void 0 ? void 0 : _a[0]) !== null && _b !== void 0 ? _b : ""),
        });
    });
});
exports.getPopularServicesPublic = getPopularServicesPublic;
/**
 * @name getAllServicesPublic
 * @description Returns latest available services for the public home page (limited).
 * @access Private
 */
const getAllServicesPublic = (_a) => __awaiter(void 0, [_a], void 0, function* ({ limit, }) {
    logger_1.default.info("[DB] getAllServicesPublic CALLED");
    const effectiveLimit = Math.min(50, Math.max(1, limit !== null && limit !== void 0 ? limit : 12));
    const rows = yield service_repository_1.serviceRepository.getLatestServices(effectiveLimit);
    return rows.map((s) => {
        var _a, _b;
        return ({
            id: s.id,
            name: s.name,
            price: String(s.price),
            image: ((_b = (_a = s.images) === null || _a === void 0 ? void 0 : _a[0]) !== null && _b !== void 0 ? _b : ""),
        });
    });
});
exports.getAllServicesPublic = getAllServicesPublic;
/**
 * @name searchServicesPublic
 * @description Searches available services by name for the public home page (limited).
 * @access Private
 */
const searchServicesPublic = (_a) => __awaiter(void 0, [_a], void 0, function* ({ q, limit, }) {
    const effectiveLimit = Math.min(50, Math.max(1, limit !== null && limit !== void 0 ? limit : 12));
    const query = q.trim();
    if (!query)
        return [];
    const rows = yield service_repository_1.serviceRepository.searchServices(query, effectiveLimit);
    return rows.map((s) => {
        var _a, _b;
        return ({
            id: s.id,
            name: s.name,
            price: String(s.price),
            image: ((_b = (_a = s.images) === null || _a === void 0 ? void 0 : _a[0]) !== null && _b !== void 0 ? _b : ""),
        });
    });
});
exports.searchServicesPublic = searchServicesPublic;
