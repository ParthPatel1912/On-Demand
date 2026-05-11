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
exports.createContact = exports.findAllContacts = void 0;
const contact_model_1 = __importDefault(require("../models/contact.model"));
const sequelize_1 = require("sequelize");
/**
 * @name findAllContacts
 * @description
 * Fetch contacts from the database with support for pagination, filtering by name and submission date, and sorting by specified fields.
 * Supports partial name matching and exact date filtering (ignoring time).
 * @access Private
 */
const findAllContacts = (query) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const where = {};
    if ((_a = query.name) === null || _a === void 0 ? void 0 : _a.trim()) {
        where.name = { [sequelize_1.Op.iLike]: `%${query.name.trim()}%` };
    }
    if (query.submissionDate) {
        const startOfDay = new Date(query.submissionDate);
        const endOfDay = new Date(query.submissionDate);
        endOfDay.setHours(23, 59, 59, 999);
        where.createdAt = {
            [sequelize_1.Op.between]: [startOfDay, endOfDay],
        };
    }
    const allowedSortFields = ["id", "name", "email", "createdAt"];
    const sortBy = allowedSortFields.includes(query.sortBy || "")
        ? query.sortBy
        : "createdAt";
    const sortOrder = query.sortOrder === "ASC" ? "ASC" : "DESC";
    return yield contact_model_1.default.findAndCountAll({
        where,
        limit: query.limit,
        offset: query.offset,
        order: [[sortBy, sortOrder]],
    });
});
exports.findAllContacts = findAllContacts;
/**
 * @name createContact
 * @description
 * Create a new contact entry in the database with the provided details.
 * @access Public
 */
const createContact = (data) => __awaiter(void 0, void 0, void 0, function* () {
    return yield contact_model_1.default.create(data);
});
exports.createContact = createContact;
