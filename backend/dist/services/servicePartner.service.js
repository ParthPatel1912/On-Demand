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
exports.getAssignedBookings = exports.approveRejectPartner = exports.getServicePartnerById = exports.deleteServicePartner = exports.updateStatus = exports.getServicePartners = exports.registerPartner = void 0;
const sequelize_1 = require("sequelize");
const db_1 = __importDefault(require("../configs/db"));
const servicePartnerRepository = __importStar(require("../repositories/servicePartner.repository"));
const roleRepository = __importStar(require("../repositories/role.repository"));
const models_1 = require("../models");
const apiError_util_1 = require("../utils/apiError.util");
const sequelize_2 = require("sequelize");
const servicePartner_enum_1 = require("../enums/servicePartner.enum");
const userRole_enum_1 = require("../enums/userRole.enum");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const mail_util_1 = require("../utils/mail.util");
const logger_1 = __importDefault(require("../utils/logger"));
const cloudinary_util_1 = require("../utils/cloudinary.util");
const messages_1 = require("../constants/messages");
const enums_1 = require("../enums");
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";
const JWT_SECRET = process.env.JWT_SECRET;
/**
 * @name registerPartner
 * @description
 * Handles the registration of a new service partner, including creating a user record,
 * partner profile, and associated details like education, skills, and documents.
 * @access Public
 */
const registerPartner = (data, files) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f, _g, _h;
    const t = yield db_1.default.transaction();
    try {
        // 1. Get Role ID for Service Partner
        const spRole = yield roleRepository.findRoleByName(userRole_enum_1.UserRole.SERVICE_PARTNER);
        if (!spRole) {
            throw new apiError_util_1.ApiError(enums_1.STATUS_CODE.INTERNAL_SERVER_ERROR, messages_1.MESSAGES.ROLE.NOT_FOUND);
        }
        // 2. Create or Find User
        const existingUsers = yield servicePartnerRepository.findUsersByEmailOrMobile(data.email, data.mobile, t);
        // Separate our targets
        const userByEmail = existingUsers.find(u => u.email === data.email);
        const userByMobile = existingUsers.find(u => u.mobileNumber === data.mobile);
        // Conflict: The mobile number is already taken by a different user account
        if (userByMobile && (!userByEmail || userByEmail.id !== userByMobile.id)) {
            throw new apiError_util_1.ApiError(enums_1.STATUS_CODE.BAD_REQUEST, messages_1.MESSAGES.USER.USER_MOBILE_EXISTS);
        }
        let user = userByEmail;
        if (user) {
            if (user.roleId === spRole.id) {
                const existingPartner = yield servicePartnerRepository.findServicePartnerByUserId(user.id, t);
                if (existingPartner) {
                    throw new apiError_util_1.ApiError(enums_1.STATUS_CODE.BAD_REQUEST, messages_1.MESSAGES.EXPERT.PROFILE_EXISTS);
                }
            }
            else {
                user.roleId = spRole.id;
            }
            // Update user details regardless of previous role
            user.mobileNumber = data.mobile;
            user.profileImage = (_b = (_a = files.profileImage) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.path;
            user.cloudinaryId = (_d = (_c = files.profileImage) === null || _c === void 0 ? void 0 : _c[0]) === null || _d === void 0 ? void 0 : _d.cloudinaryId;
            yield user.save({ transaction: t });
        }
        else {
            user = yield servicePartnerRepository.createUser({
                name: data.fullName,
                email: data.email,
                roleId: spRole.id,
                mobileNumber: data.mobile,
                profileImage: (_f = (_e = files.profileImage) === null || _e === void 0 ? void 0 : _e[0]) === null || _f === void 0 ? void 0 : _f.path,
                cloudinaryId: (_h = (_g = files.profileImage) === null || _g === void 0 ? void 0 : _g[0]) === null || _h === void 0 ? void 0 : _h.cloudinaryId,
                isActive: false
            }, t);
        }
        // 3. Format Data for ServicePartner
        const [day, month, year] = data.dob.split('/');
        const formattedDob = `${year}-${month}-${day}`;
        const capitalizedGender = data.gender.charAt(0).toUpperCase() + data.gender.slice(1).toLowerCase();
        // 4. Create ServicePartner
        const partner = yield servicePartnerRepository.createServicePartner({
            userId: user.id,
            dob: formattedDob,
            gender: capitalizedGender,
            serviceTypeIds: data.applyingFor,
            permanentAddress: data.permanentAddress,
            residentialAddress: data.residentialAddress,
            verificationStatus: servicePartner_enum_1.VerificationStatus.PENDING,
            status: servicePartner_enum_1.ServicePartnerStatus.INACTIVE
        }, t);
        // 4. Create Educations
        if (data.education && data.education.length > 0) {
            const educations = data.education.map((edu) => ({
                partnerId: partner.id,
                schoolCollege: edu.school,
                passingYear: edu.year,
                marks: edu.marks.toString()
            }));
            yield servicePartnerRepository.bulkCreateEducation(educations, t);
        }
        // 5. Create Experiences (Professional)
        if (data.professional && data.professional.length > 0) {
            const experiences = data.professional.map((exp) => ({
                partnerId: partner.id,
                companyName: exp.company,
                role: exp.role,
                from: exp.from,
                to: exp.to
            }));
            yield servicePartnerRepository.bulkCreateExperience(experiences, t);
        }
        // 6. Create Skills
        if (data.skills && data.skills.length > 0) {
            const skills = data.skills.map((catId) => ({
                partnerId: partner.id,
                categoryId: catId
            }));
            yield servicePartnerRepository.bulkCreateSkills(skills, t);
        }
        // 7. Create Services (Services Offered)
        if (data.servicesOffered && data.servicesOffered.length > 0) {
            const services = data.servicesOffered.map((subCatId) => ({
                partnerId: partner.id,
                subCategoryId: subCatId
            }));
            yield servicePartnerRepository.bulkCreateServices(services, t);
        }
        // 8. Create Languages
        if (data.languages && data.languages.length > 0) {
            const languages = data.languages.map((lang) => {
                const capitalizedProficiency = lang.proficiency.charAt(0).toUpperCase() + lang.proficiency.slice(1).toLowerCase();
                const proficiencyValue = capitalizedProficiency === 'Advanced' ? 'Expert' : capitalizedProficiency;
                return {
                    partnerId: partner.id,
                    language: lang.language.charAt(0).toUpperCase() + lang.language.slice(1).toLowerCase(),
                    proficiency: proficiencyValue
                };
            });
            yield servicePartnerRepository.bulkCreateLanguages(languages, t);
        }
        // 9. Create Documents (Attachments)
        if (files.attachments && files.attachments.length > 0) {
            const documents = files.attachments.map((doc) => ({
                partnerId: partner.id,
                documentUrl: doc.path,
                documentName: doc.originalname,
                size: doc.size,
                cloudinaryId: doc.cloudinaryId
            }));
            yield servicePartnerRepository.bulkCreateDocuments(documents, t);
        }
        yield t.commit();
        return {
            message: messages_1.MESSAGES.AUTH.REGISTER_SUCCESS,
            partnerId: partner.id,
            userId: user.id
        };
    }
    catch (error) {
        yield t.rollback();
        throw error;
    }
});
exports.registerPartner = registerPartner;
/**
 * @name getServicePartners
 * @description
 * Fetches a paginated list of service partners with filtering options.
 * @access Private (Admin)
 */
const getServicePartners = (query) => __awaiter(void 0, void 0, void 0, function* () {
    const { page = 1, limit = 10, sortBy = "id", sortOrder = "DESC", serviceTypeId, status, minJobs, maxJobs, } = query;
    const offset = (Number(page) - 1) * Number(limit);
    const filterConditions = {};
    const userFilterConditions = {};
    if (serviceTypeId) {
        filterConditions.serviceTypeId = serviceTypeId;
    }
    if (status) {
        if (status === servicePartner_enum_1.VerificationStatus.PENDING) {
            filterConditions.verificationStatus = servicePartner_enum_1.VerificationStatus.PENDING;
        }
        else if (status === servicePartner_enum_1.VerificationStatus.REJECTED) {
            filterConditions.verificationStatus = servicePartner_enum_1.VerificationStatus.REJECTED;
        }
        else if (status === servicePartner_enum_1.ServicePartnerStatus.ACTIVE) {
            filterConditions.verificationStatus = servicePartner_enum_1.VerificationStatus.VERIFIED;
            userFilterConditions.isActive = true;
        }
        else if (status === servicePartner_enum_1.ServicePartnerStatus.INACTIVE) {
            filterConditions.verificationStatus = servicePartner_enum_1.VerificationStatus.VERIFIED;
            userFilterConditions.isActive = false;
        }
    }
    const allowedSortFields = ["id", "name", "createdAt", "jobsCompleted"];
    const sortField = allowedSortFields.includes(sortBy) ? sortBy : "id";
    const order = [];
    if (sortField === "jobsCompleted") {
        order.push([
            (0, sequelize_2.literal)('COUNT("bookings"."id")'),
            sortOrder === "ASC" ? "ASC" : "DESC",
        ]);
    }
    else if (sortField === "name") {
        order.push([
            { model: models_1.User, as: "user" },
            "name",
            sortOrder === "ASC" ? "ASC" : "DESC",
        ]);
    }
    else {
        order.push([sortField, sortOrder === "ASC" ? "ASC" : "DESC"]);
    }
    const { rows, count: totalItems } = yield servicePartnerRepository.findAllServicePartners({
        where: filterConditions,
        userWhere: Object.keys(userFilterConditions).length ? userFilterConditions : undefined,
        order,
        limit: Number(limit),
        offset,
        having: minJobs || maxJobs
            ? (0, sequelize_2.literal)(`
          COUNT(bookings.id) ${minJobs ? `>= ${Number(minJobs)}` : ""}
          ${minJobs && maxJobs ? "AND" : ""}
          ${maxJobs ? `COUNT(bookings.id) <= ${Number(maxJobs)}` : ""}
        `)
            : undefined,
    });
    const data = rows.map((row) => {
        var _a;
        const partner = row.get({ plain: true });
        let displayedStatus = "";
        if (partner.verificationStatus === servicePartner_enum_1.VerificationStatus.VERIFIED) {
            displayedStatus = ((_a = partner.user) === null || _a === void 0 ? void 0 : _a.isActive)
                ? servicePartner_enum_1.ServicePartnerStatus.ACTIVE
                : servicePartner_enum_1.ServicePartnerStatus.INACTIVE;
        }
        else {
            displayedStatus = partner.verificationStatus;
        }
        return Object.assign(Object.assign({}, partner), { displayedStatus });
    });
    return {
        data,
        pagination: {
            currentPage: Number(page),
            limit: Number(limit),
            totalItems: Array.isArray(totalItems) ? totalItems.length : totalItems,
            totalPages: Math.ceil((Array.isArray(totalItems) ? totalItems.length : totalItems) / Number(limit))
        },
    };
});
exports.getServicePartners = getServicePartners;
/**
 * @name updateStatus
 * @description
 * Toggles the active status of a service partner's user account.
 * @access Private (Admin)
 */
const updateStatus = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const partner = yield servicePartnerRepository.findServicePartnerByPk(id);
    if (!partner) {
        throw new apiError_util_1.ApiError(enums_1.STATUS_CODE.NOT_FOUND, messages_1.MESSAGES.EXPERT.NOT_FOUND_PARTNER);
    }
    const user = yield servicePartnerRepository.findUserByPk(partner.userId);
    if (!user) {
        throw new apiError_util_1.ApiError(enums_1.STATUS_CODE.NOT_FOUND, messages_1.MESSAGES.USER.NOT_FOUND);
    }
    user.isActive = !user.isActive;
    yield user.save();
    return {
        message: user.isActive ? messages_1.MESSAGES.EXPERT.ACTIVATED : messages_1.MESSAGES.EXPERT.DEACTIVATED,
        isActive: user.isActive
    };
});
exports.updateStatus = updateStatus;
/**
 * @name deleteServicePartner
 * @description
 * Deletes a service partner profile and their associated user account.
 * Also cleans up any uploaded documents from Cloudinary.
 * @access Private (Admin)
 */
const deleteServicePartner = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const t = yield db_1.default.transaction();
    try {
        const partner = yield servicePartnerRepository.findServicePartnerByPk(id, {
            include: [{ model: models_1.ServicePartnerDocument, as: 'documents' }],
            transaction: t
        });
        if (!partner) {
            throw new apiError_util_1.ApiError(enums_1.STATUS_CODE.NOT_FOUND, messages_1.MESSAGES.EXPERT.NOT_FOUND_PARTNER);
        }
        const userId = partner.userId;
        const documents = partner.documents || [];
        const cloudinaryIdsToDelete = documents
            .filter((doc) => doc.cloudinaryId)
            .map((doc) => doc.cloudinaryId);
        if (cloudinaryIdsToDelete.length > 0) {
            yield Promise.allSettled(cloudinaryIdsToDelete.map(pid => (0, cloudinary_util_1.deleteImage)(pid)));
        }
        yield partner.destroy({ transaction: t });
        yield models_1.User.destroy({ where: { id: userId }, transaction: t });
        yield t.commit();
        return {
            message: messages_1.MESSAGES.EXPERT.DELETED
        };
    }
    catch (error) {
        yield t.rollback();
        throw error;
    }
});
exports.deleteServicePartner = deleteServicePartner;
/**
 * @name getServicePartnerById
 * @description
 * Fetches a detailed profile of a service partner by their ID.
 * @access Private (Admin)
 */
const getServicePartnerById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const servicePartner = yield servicePartnerRepository.findServicePartnerWithDetails(id);
    if (!servicePartner) {
        throw new apiError_util_1.ApiError(enums_1.STATUS_CODE.NOT_FOUND, messages_1.MESSAGES.EXPERT.NOT_FOUND_PARTNER);
    }
    const partner = servicePartner.get({ plain: true });
    let displayedStatus = "";
    if (partner.verificationStatus === servicePartner_enum_1.VerificationStatus.VERIFIED) {
        displayedStatus = ((_a = partner.user) === null || _a === void 0 ? void 0 : _a.isActive)
            ? servicePartner_enum_1.ServicePartnerStatus.ACTIVE
            : servicePartner_enum_1.ServicePartnerStatus.INACTIVE;
    }
    else {
        displayedStatus = partner.verificationStatus;
    }
    return Object.assign(Object.assign({}, partner), { displayedStatus });
});
exports.getServicePartnerById = getServicePartnerById;
/**
 * @name approveRejectPartner
 * @description
 * Approves or rejects a service partner's registration request.
 * If approved, generates a password reset token and sends an approval email.
 * @access Private (Admin)
 */
const approveRejectPartner = (id, action) => __awaiter(void 0, void 0, void 0, function* () {
    const t = yield db_1.default.transaction();
    try {
        const servicePartner = yield servicePartnerRepository.findServicePartnerByPk(id, { transaction: t });
        if (!servicePartner) {
            throw new apiError_util_1.ApiError(enums_1.STATUS_CODE.NOT_FOUND, messages_1.MESSAGES.EXPERT.NOT_FOUND_PARTNER);
        }
        const user = yield servicePartnerRepository.findUserByPk(servicePartner.userId, { transaction: t });
        if (!user) {
            throw new apiError_util_1.ApiError(enums_1.STATUS_CODE.NOT_FOUND, messages_1.MESSAGES.USER.NOT_FOUND);
        }
        if (action === 'approve') {
            servicePartner.verificationStatus = servicePartner_enum_1.VerificationStatus.VERIFIED;
            servicePartner.status = servicePartner_enum_1.ServicePartnerStatus.ACTIVE;
            user.isActive = true;
            const resetToken = jsonwebtoken_1.default.sign({ sub: user.id, email: user.email, type: "password_reset" }, JWT_SECRET, { expiresIn: "24h" });
            user.rememberToken = resetToken;
            logger_1.default.info(`Generated reset token for approved partner: ${user.email}`);
        }
        else if (action === 'reject') {
            servicePartner.verificationStatus = servicePartner_enum_1.VerificationStatus.REJECTED;
            servicePartner.status = servicePartner_enum_1.ServicePartnerStatus.INACTIVE;
            user.isActive = false;
        }
        yield servicePartner.save({ transaction: t });
        yield user.save({ transaction: t });
        yield t.commit();
        if (action === 'approve') {
            const resetLink = `${FRONTEND_URL}/partner/reset-password?token=${user.rememberToken}`;
            (0, mail_util_1.sendPartnerApprovalEmail)(user.email, user.name, resetLink).catch((err) => {
                logger_1.default.error(`Failed to send approval email to ${user.email}:`, err);
            });
        }
        else {
            (0, mail_util_1.sendPartnerRejectionEmail)(user.email, user.name).catch((err) => {
                logger_1.default.error(`Failed to send rejection email to ${user.email}:`, err);
            });
        }
        return {
            message: action === 'approve' ? messages_1.MESSAGES.EXPERT.APPROVED : messages_1.MESSAGES.EXPERT.REJECTED,
            partnerId: servicePartner.id,
            verificationStatus: servicePartner.verificationStatus,
            status: servicePartner.status
        };
    }
    catch (error) {
        yield t.rollback();
        throw error;
    }
});
exports.approveRejectPartner = approveRejectPartner;
/**
 * @name getAssignedBookings
 * @description
 * Fetches a paginated list of bookings assigned to a specific service partner,
 * with optional filtering by status, date, and time.
 * @access Private (Admin)
 */
const getAssignedBookings = (partnerId, query) => __awaiter(void 0, void 0, void 0, function* () {
    const { page = 1, limit = 10, status, date, time } = query;
    const offset = (Number(page) - 1) * Number(limit);
    const filterConditions = {
        servicePartnerId: partnerId
    };
    if (status) {
        filterConditions.status = status;
    }
    if (date) {
        filterConditions.bookingDate = (0, sequelize_1.where)((0, sequelize_2.fn)('DATE', (0, sequelize_2.col)('booking_date')), date);
    }
    if (time) {
        const [hours, minutes] = time.split(':').map(Number);
        const timeFilter = {
            [sequelize_2.Op.and]: [
                db_1.default.where(db_1.default.fn('EXTRACT', db_1.default.literal('HOUR FROM booking_date')), hours),
                db_1.default.where(db_1.default.fn('EXTRACT', db_1.default.literal('MINUTE FROM booking_date')), minutes)
            ]
        };
        if (filterConditions.bookingDate) {
            filterConditions[sequelize_2.Op.and] = [
                { bookingDate: filterConditions.bookingDate },
                timeFilter
            ];
            delete filterConditions.bookingDate;
        }
        else {
            filterConditions[sequelize_2.Op.and] = timeFilter[sequelize_2.Op.and];
        }
    }
    const { rows, count } = yield servicePartnerRepository.findAssignedBookings({
        where: filterConditions,
        limit: Number(limit),
        offset: offset,
    });
    return {
        bookings: rows,
        totalCount: count,
        totalPages: Math.ceil(count / Number(limit)),
        currentPage: Number(page)
    };
});
exports.getAssignedBookings = getAssignedBookings;
