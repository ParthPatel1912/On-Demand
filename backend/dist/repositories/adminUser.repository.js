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
exports.hardDeleteAdmin = exports.deleteAdmin = exports.updateAdmin = exports.createAdmin = exports.findAdminById = exports.findAdminByEmail = exports.findAllAdmins = exports.getAdminRoleId = void 0;
const models_1 = require("../models");
const logger_1 = __importDefault(require("../utils/logger"));
/**
 * @name getAdminRoleId
 * @description
 * Fetches the ID of the "ADMIN" role from the database. This is used to ensure that all admin-related operations are performed on users with the correct role.
 * If the "ADMIN" role is not found, it logs an error and returns null, which should be handled by the calling service to prevent further issues.
 * @access Private
 */
const getAdminRoleId = () => __awaiter(void 0, void 0, void 0, function* () {
    const role = yield models_1.Role.findOne({ where: { name: "ADMIN" } });
    if (!role) {
        logger_1.default.error("ADMIN role not found in the database.");
        return null;
    }
    return role.id;
});
exports.getAdminRoleId = getAdminRoleId;
/**
 * @name findAllAdmins
 * @description
 * Fetches a paginated list of admin users based on the provided query parameters.
 * It ensures that only users with the "ADMIN" role are included in the results.
 * @access Private | Role-based
 */
const findAllAdmins = (query) => __awaiter(void 0, void 0, void 0, function* () {
    const finalWhere = Object.assign(Object.assign({}, query.where), { roleId: query.adminRoleId });
    return yield models_1.User.findAndCountAll({
        where: finalWhere,
        limit: query.limit,
        offset: query.offset,
        order: [[query.sortBy, query.sortOrder]],
        attributes: { exclude: ["password"] },
        include: [
            {
                model: models_1.Role,
                as: "role",
                attributes: ["id", "name"],
            },
        ],
    });
});
exports.findAllAdmins = findAllAdmins;
/**
 * @name findAdminByEmail
 * @description
 * Fetches an admin user by their email address.
 * @access Private | Role-based
 */
const findAdminByEmail = (email_1, ...args_1) => __awaiter(void 0, [email_1, ...args_1], void 0, function* (email, paranoid = true) {
    return yield models_1.User.findOne({
        where: { email },
        paranoid,
    });
});
exports.findAdminByEmail = findAdminByEmail;
/**
 * @name findAdminById
 * @description
 * Fetches an admin user by their unique identifier (ID).
 * @access Private | Role-based
 */
const findAdminById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    return yield models_1.User.findByPk(id);
});
exports.findAdminById = findAdminById;
/**
 * @name createAdmin
 * @description
 * Creates a new admin user with the provided data.
 * The data should include all necessary fields such as name, email, password, and roleId (which should correspond to the ADMIN role).
 * @access Private | Role-based
 */
const createAdmin = (data) => __awaiter(void 0, void 0, void 0, function* () {
    return yield models_1.User.create(data);
});
exports.createAdmin = createAdmin;
/**
 * @name updateAdmin
 * @description
 * Updates an existing admin user's details based on their ID.
 * The function first checks if the admin user exists.
 * @access Private | Role-based
 */
const updateAdmin = (id, data) => __awaiter(void 0, void 0, void 0, function* () {
    const admin = yield (0, exports.findAdminById)(id);
    if (!admin)
        return null;
    return yield admin.update(data);
});
exports.updateAdmin = updateAdmin;
/**
 * @name deleteAdmin
 * @description
 * Deletes an admin user by their ID.
 * This is a soft delete, meaning the record will not be permanently removed from the database but will be marked as deleted (if paranoid mode is enabled in Sequelize). The function first checks if the admin user exists. If not, it returns null. If the admin user is found, it performs the delete operation and returns true to indicate successful deletion.
 * @access Private | Role-based
 */
const deleteAdmin = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const admin = yield (0, exports.findAdminById)(id);
    if (!admin)
        return null;
    yield admin.destroy();
    return true;
});
exports.deleteAdmin = deleteAdmin;
/**
 * @name hardDeleteAdmin
 * @description
 * Permanently deletes an admin user from the database by their ID, bypassing the soft delete mechanism.
 * This function is used to completely remove a record, including those that have been soft-deleted (marked as deleted but still present in the database).
 * It first checks if the admin user exists, regardless of their deletion status, and if found, it performs a hard delete using the `force: true` option in Sequelize's destroy method.
 * If the admin user is not found, it returns null; otherwise, it returns true to indicate successful permanent deletion.
 * @access Private | Role-based
 */
const hardDeleteAdmin = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const admin = yield models_1.User.findByPk(id, { paranoid: false });
    if (!admin)
        return null;
    yield admin.destroy({ force: true });
    return true;
});
exports.hardDeleteAdmin = hardDeleteAdmin;
