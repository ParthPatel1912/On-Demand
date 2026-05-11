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
exports.findAssignedBookings = exports.findServicePartnerWithDetails = exports.findUserByPk = exports.findServicePartnerByPk = exports.findAllServicePartners = exports.bulkCreateDocuments = exports.bulkCreateLanguages = exports.bulkCreateServices = exports.bulkCreateSkills = exports.bulkCreateExperience = exports.bulkCreateEducation = exports.findServicePartnerByUserId = exports.createServicePartner = exports.createUser = exports.findUsersByEmailOrMobile = void 0;
const models_1 = require("../models");
const booking_model_1 = __importDefault(require("../models/booking.model"));
const transaction_enum_1 = require("../enums/transaction.enum");
const sequelize_1 = require("sequelize");
/**
 * @name findUserByEmailOrMobile
 * @description
 * Fetches a user that matches either the provided email OR the mobile number.
 * @access Private
 */
const findUsersByEmailOrMobile = (email, mobile, transaction) => __awaiter(void 0, void 0, void 0, function* () {
    const { Op } = require("sequelize");
    return yield models_1.User.findAll({
        where: {
            [Op.or]: [{ email }, { mobileNumber: mobile }]
        },
        attributes: ["id", "name", "email", "mobileNumber", "roleId", "isActive"],
        transaction
    });
});
exports.findUsersByEmailOrMobile = findUsersByEmailOrMobile;
/**
 * @name createUser
 * @description
 * Creates a new user record.
 * @access Private
 */
const createUser = (data, transaction) => __awaiter(void 0, void 0, void 0, function* () {
    return yield models_1.User.create(data, { transaction });
});
exports.createUser = createUser;
/**
 * @name createServicePartner
 * @description
 * Creates a new service partner record.
 * @access Private
 */
const createServicePartner = (data, transaction) => __awaiter(void 0, void 0, void 0, function* () {
    return yield models_1.ServicePartner.create(data, { transaction });
});
exports.createServicePartner = createServicePartner;
/**
 * @name findServicePartnerByUserId
 * @description
 * Fetches a service partner by their associated user ID.
 * @access Private
 */
const findServicePartnerByUserId = (userId, transaction) => __awaiter(void 0, void 0, void 0, function* () {
    return yield models_1.ServicePartner.findOne({
        where: { userId },
        attributes: ["id"],
        transaction
    });
});
exports.findServicePartnerByUserId = findServicePartnerByUserId;
/**
 * @name bulkCreateEducation
 * @description
 * Creates multiple education records for a service partner.
 * @access Private
 */
const bulkCreateEducation = (data, transaction) => __awaiter(void 0, void 0, void 0, function* () {
    return yield models_1.ServicePartnerEducation.bulkCreate(data, { transaction });
});
exports.bulkCreateEducation = bulkCreateEducation;
/**
 * @name bulkCreateExperience
 * @description
 * Creates multiple experience records for a service partner.
 * @access Private
 */
const bulkCreateExperience = (data, transaction) => __awaiter(void 0, void 0, void 0, function* () {
    return yield models_1.ServicePartnerExperience.bulkCreate(data, { transaction });
});
exports.bulkCreateExperience = bulkCreateExperience;
/**
 * @name bulkCreateSkills
 * @description
 * Creates multiple skill records for a service partner.
 * @access Private
 */
const bulkCreateSkills = (data, transaction) => __awaiter(void 0, void 0, void 0, function* () {
    return yield models_1.ServicePartnerSkill.bulkCreate(data, { transaction });
});
exports.bulkCreateSkills = bulkCreateSkills;
/**
 * @name bulkCreateServices
 * @description
 * Creates multiple service records for a service partner.
 * @access Private
 */
const bulkCreateServices = (data, transaction) => __awaiter(void 0, void 0, void 0, function* () {
    return yield models_1.ServicePartnerService.bulkCreate(data, { transaction });
});
exports.bulkCreateServices = bulkCreateServices;
/**
 * @name bulkCreateLanguages
 * @description
 * Creates multiple language records for a service partner.
 * @access Private
 */
const bulkCreateLanguages = (data, transaction) => __awaiter(void 0, void 0, void 0, function* () {
    return yield models_1.ServicePartnerLanguage.bulkCreate(data, { transaction });
});
exports.bulkCreateLanguages = bulkCreateLanguages;
/**
 * @name bulkCreateDocuments
 * @description
 * Creates multiple document records for a service partner.
 * @access Private
 */
const bulkCreateDocuments = (data, transaction) => __awaiter(void 0, void 0, void 0, function* () {
    return yield models_1.ServicePartnerDocument.bulkCreate(data, { transaction });
});
exports.bulkCreateDocuments = bulkCreateDocuments;
/**
 * @name findAllServicePartners
 * @description
 * Fetches a paginated list of service partners with optional filtering and sorting.
 * Includes jobs completed count and associated user/service type info.
 * @access Private | Role-based
 */
const findAllServicePartners = (options) => __awaiter(void 0, void 0, void 0, function* () {
    return yield models_1.ServicePartner.findAndCountAll({
        where: options.where,
        attributes: [
            "id",
            "userId",
            "serviceTypeId",
            "verificationStatus",
            "status",
            "createdAt",
            [
                (0, sequelize_1.fn)("COUNT", (0, sequelize_1.col)("bookings.id")),
                "jobsCompleted"
            ]
        ],
        include: [
            {
                model: booking_model_1.default,
                as: "bookings",
                attributes: [],
                required: false,
                where: {
                    status: transaction_enum_1.BookingStatus.COMPLETED
                }
            },
            {
                model: models_1.User,
                as: "user",
                where: options.userWhere,
                attributes: ["id", "name", "email", "mobileNumber", "profileImage", "isActive"],
            },
            {
                model: models_1.ServiceType,
                as: "serviceType",
                attributes: ["id", "name"],
            },
        ],
        group: ["ServicePartner.id", "user.id", "user.name", "serviceType.id", "serviceType.name"],
        having: options.having,
        order: options.order,
        limit: options.limit,
        offset: options.offset,
        subQuery: false,
    });
});
exports.findAllServicePartners = findAllServicePartners;
/**
 * @name findServicePartnerByPk
 * @description
 * Fetches essential service partner fields (id, userId, verificationStatus, status) by primary key.
 * @access Private
 */
const findServicePartnerByPk = (id_1, ...args_1) => __awaiter(void 0, [id_1, ...args_1], void 0, function* (id, options = {}) {
    return yield models_1.ServicePartner.findByPk(id, Object.assign({ attributes: ["id", "userId", "verificationStatus", "status"] }, options));
});
exports.findServicePartnerByPk = findServicePartnerByPk;
/**
 * @name findUserByPk
 * @description
 * Fetches essential user fields (id, name, email, role, isActive, rememberToken) by primary key.
 * @access Private
 */
const findUserByPk = (id_1, ...args_1) => __awaiter(void 0, [id_1, ...args_1], void 0, function* (id, options = {}) {
    return yield models_1.User.findByPk(id, Object.assign({ attributes: ["id", "name", "email", "roleId", "isActive", "rememberToken"] }, options));
});
exports.findUserByPk = findUserByPk;
/**
 * @name findServicePartnerWithDetails
 * @description
 * Fetches a service partner by ID with all associated details (education, experience, skills, etc.).
 * @access Private
 */
const findServicePartnerWithDetails = (id, transaction) => __awaiter(void 0, void 0, void 0, function* () {
    return yield models_1.ServicePartner.findByPk(id, {
        transaction,
        attributes: [
            "id",
            "userId",
            "dob",
            "gender",
            "serviceTypeId",
            "permanentAddress",
            "residentialAddress",
            "verificationStatus",
            "status",
            "createdAt"
        ],
        include: [
            {
                model: models_1.User,
                as: 'user',
                attributes: ['id', 'name', 'email', 'isActive', 'mobileNumber', 'profileImage']
            },
            {
                model: models_1.ServiceType,
                as: 'serviceType',
                attributes: ['id', 'name']
            },
            {
                model: models_1.ServicePartnerEducation,
                as: 'educations',
                attributes: ['id', 'schoolCollege', 'passingYear', 'marks'],
                separate: true
            },
            {
                model: models_1.ServicePartnerExperience,
                as: 'experiences',
                attributes: ['id', 'companyName', 'role', 'from', 'to'],
                separate: true
            },
            {
                model: models_1.ServicePartnerSkill,
                as: 'skills',
                attributes: ['id', 'categoryId'],
                separate: true,
                include: [{
                        model: models_1.Category,
                        as: 'category',
                        attributes: ['id', 'name']
                    }]
            },
            {
                model: models_1.ServicePartnerService,
                as: 'services',
                attributes: ['id', 'subCategoryId'],
                separate: true,
                include: [{
                        model: models_1.SubCategory,
                        as: 'subCategory',
                        attributes: ['id', 'name']
                    }]
            },
            {
                model: models_1.ServicePartnerLanguage,
                as: 'languages',
                attributes: ['id', 'language', 'proficiency'],
                separate: true
            },
            {
                model: models_1.ServicePartnerDocument,
                as: 'documents',
                attributes: ['id', 'documentUrl', 'documentName', 'size'],
                separate: true
            }
        ]
    });
});
exports.findServicePartnerWithDetails = findServicePartnerWithDetails;
/**
 * @name findAssignedBookings
 * @description
 * Fetches a paginated list of bookings assigned to a specific service partner.
 * @access Private
 */
const findAssignedBookings = (options) => __awaiter(void 0, void 0, void 0, function* () {
    return yield booking_model_1.default.findAndCountAll({
        where: options.where,
        include: [
            {
                model: models_1.Service,
                as: "service",
                attributes: ["id", "name"]
            },
            {
                model: models_1.User,
                as: "customer",
                attributes: ["id", "name"]
            }
        ],
        order: [["bookingDate", "DESC"]],
        limit: options.limit,
        offset: options.offset,
        distinct: true
    });
});
exports.findAssignedBookings = findAssignedBookings;
