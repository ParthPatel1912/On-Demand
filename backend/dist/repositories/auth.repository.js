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
Object.defineProperty(exports, "__esModule", { value: true });
exports.findCustomerById = exports.findUserByEmail = exports.findUserById = exports.findUserByResetToken = exports.findUserByEmailWithRole = void 0;
const models_1 = require("../models");
/**
 * @name findUserByEmailWithRole
 * @description
 * Fetches a user by their email address, including their associated role information.
 * @access Public
 */
const findUserByEmailWithRole = (email) => __awaiter(void 0, void 0, void 0, function* () {
    return yield models_1.User.findOne({
        where: { email: email.toLowerCase() },
        include: [{ model: models_1.Role, as: "role", attributes: ["name"] }],
    });
});
exports.findUserByEmailWithRole = findUserByEmailWithRole;
/**
 * @name findUserByResetToken
 * @description
 * Fetches a user by their ID and remember token, typically used for password reset functionality.
 * @access Public
 */
const findUserByResetToken = (id, rememberToken) => __awaiter(void 0, void 0, void 0, function* () {
    return yield models_1.User.findOne({
        where: {
            id,
            rememberToken,
        },
    });
});
exports.findUserByResetToken = findUserByResetToken;
/**
 * @name findUserById
 * @description
 * Fetches a user by their unique identifier (ID).
 * @access Public
 */
const findUserById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    return yield models_1.User.findByPk(id);
});
exports.findUserById = findUserById;
/**
 * @name findUserByEmail
 * @description
 * Fetches a user by their email identifier (EMAIL).
 * @access Public
 */
const findUserByEmail = (email) => __awaiter(void 0, void 0, void 0, function* () {
    return yield models_1.User.findOne({ where: { email } });
});
exports.findUserByEmail = findUserByEmail;
/**
 * @name findCustomerById
 * @description
 * Fetches a user by their id identifier (ID).
 * @access Public
 */
const findCustomerById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    return yield models_1.User.findOne({
        where: { id, role: "customer" },
        attributes: ["id", "name", "email", "emailVerifiedAt"],
    });
});
exports.findCustomerById = findCustomerById;
