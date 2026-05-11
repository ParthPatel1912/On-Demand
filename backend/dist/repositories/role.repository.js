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
exports.deleteRole = exports.updateRole = exports.createRole = exports.findRoleByName = exports.findRoleById = exports.findAllRoles = exports.getRoleIdByName = void 0;
const role_model_1 = __importDefault(require("../models/role.model"));
/**
 * Repository for Role model operations.
 */
const roleIdCache = new Map();
const getRoleIdByName = (name) => __awaiter(void 0, void 0, void 0, function* () {
    const cached = roleIdCache.get(name);
    if (cached)
        return cached;
    const role = yield role_model_1.default.findOne({
        where: { name },
        attributes: ["id"],
        raw: true,
    });
    const id = Number(role === null || role === void 0 ? void 0 : role.id);
    if (!Number.isFinite(id))
        return null;
    roleIdCache.set(name, id);
    return id;
});
exports.getRoleIdByName = getRoleIdByName;
const findAllRoles = (options) => __awaiter(void 0, void 0, void 0, function* () {
    return yield role_model_1.default.findAll({
        where: options.where,
        order: [[options.sortBy, options.sortOrder]],
        attributes: ["id", "name", "description", "createdAt"],
    });
});
exports.findAllRoles = findAllRoles;
const findRoleById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    return yield role_model_1.default.findByPk(id, {
        attributes: ["id", "name", "description"],
    });
});
exports.findRoleById = findRoleById;
const findRoleByName = (name) => __awaiter(void 0, void 0, void 0, function* () {
    return yield role_model_1.default.findOne({
        where: { name },
        attributes: ["id"],
    });
});
exports.findRoleByName = findRoleByName;
const createRole = (data) => __awaiter(void 0, void 0, void 0, function* () {
    return yield role_model_1.default.create(data);
});
exports.createRole = createRole;
const updateRole = (id, data) => __awaiter(void 0, void 0, void 0, function* () {
    const role = yield role_model_1.default.findByPk(id, {
        attributes: ["id", "name", "description"],
    });
    if (role) {
        return yield role.update(data);
    }
    return null;
});
exports.updateRole = updateRole;
const deleteRole = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const role = yield role_model_1.default.findByPk(id, {
        attributes: ["id"],
    });
    if (role) {
        return yield role.destroy();
    }
    return null;
});
exports.deleteRole = deleteRole;
