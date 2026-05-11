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
const { faker } = require("@faker-js/faker");
const db_1 = __importDefault(require("../configs/db"));
const user_model_1 = require("../models/user.model");
const service_model_1 = require("../models/service.model");
const booking_model_1 = require("../models/booking.model");
const servicePartner_model_1 = require("../models/servicePartner.model");
const serviceType_model_1 = require("../models/serviceType.model");
const category_model_1 = require("../models/category.model");
const subCategory_model_1 = require("../models/subCategory.model");
const STATUSES = ["pending", "confirmed", "completed", "cancelled"];
const generateUsers = () => __awaiter(void 0, void 0, void 0, function* () {
    const users = [];
    for (let i = 0; i < 25; i++) {
        users.push({
            name: faker.person.fullName(),
            email: faker.internet.email(),
            createdAt: new Date(),
            updatedAt: new Date(),
        });
    }
    return yield user_model_1.User.bulkCreate(users);
});
const generateServiceTypes = () => __awaiter(void 0, void 0, void 0, function* () {
    const types = [];
    for (let i = 1; i <= 3; i++) {
        types.push({
            name: faker.commerce.department() + " Type " + i,
            createdAt: new Date(),
            updatedAt: new Date(),
        });
    }
    return yield serviceType_model_1.ServiceType.bulkCreate(types);
});
const generateCategories = (serviceTypes) => __awaiter(void 0, void 0, void 0, function* () {
    const categories = [];
    for (let i = 1; i <= 5; i++) {
        categories.push({
            name: faker.commerce.department() + " Cat " + i,
            serviceTypeId: faker.helpers.arrayElement(serviceTypes).id,
            createdAt: new Date(),
            updatedAt: new Date(),
        });
    }
    return yield category_model_1.Category.bulkCreate(categories);
});
const generateSubCategories = (categories) => __awaiter(void 0, void 0, void 0, function* () {
    const subCategories = [];
    for (let i = 1; i <= 10; i++) {
        subCategories.push({
            name: faker.commerce.productMaterial() + " Sub " + i,
            categoryId: faker.helpers.arrayElement(categories).id,
            createdAt: new Date(),
            updatedAt: new Date(),
        });
    }
    return yield subCategory_model_1.SubCategory.bulkCreate(subCategories);
});
const generateServices = (categories, subCategories) => __awaiter(void 0, void 0, void 0, function* () {
    const services = [];
    for (let i = 0; i < 10; i++) {
        const category = faker.helpers.arrayElement(categories);
        const filtered = subCategories.filter(sc => sc.categoryId === category.id);
        const subCategory = filtered.length > 0 ? faker.helpers.arrayElement(filtered) : faker.helpers.arrayElement(subCategories);
        services.push({
            name: faker.commerce.productName(),
            categoryId: category.id,
            subCategoryId: subCategory.id,
            price: faker.number.float({ min: 200, max: 5000, fractionDigits: 2 }),
            duration: faker.number.int({ min: 30, max: 180 }),
            commission: faker.number.float({ min: 10, max: 100, fractionDigits: 2 }),
            availability: true,
            images: [],
            cloudinaryIds: [],
            includeServices: [],
            excludeServices: [],
            createdAt: new Date(),
            updatedAt: new Date(),
        });
    }
    return yield service_model_1.Service.bulkCreate(services);
});
// ✅ NEW: Service Partners
const generateServicePartners = (users, serviceTypes) => __awaiter(void 0, void 0, void 0, function* () {
    const partners = [];
    for (let i = 0; i < 8; i++) {
        partners.push({
            userId: faker.helpers.arrayElement(users).id,
            serviceTypeId: faker.helpers.arrayElement(serviceTypes).id,
            dob: faker.date.birthdate({ min: 20, max: 50, mode: 'age' }),
            gender: faker.helpers.arrayElement(['Male', 'Female']),
            mobileNumber: faker.string.numeric(10),
            createdAt: new Date(),
            updatedAt: new Date(),
        });
    }
    return yield servicePartner_model_1.ServicePartner.bulkCreate(partners);
});
const getRandomDate = (status) => {
    switch (status) {
        case "completed":
            return faker.date.past();
        case "confirmed":
            return faker.date.soon();
        case "pending":
            return faker.date.future();
        case "cancelled":
            return faker.date.recent();
        default:
            return new Date();
    }
};
// ✅ Smart field generator based on status
const generateBookingFields = (status, partners) => {
    let servicePartnerId = null;
    let amount = null;
    let receiptUrl = null;
    let serviceDuration = null;
    // Assign partner only if not pending
    if (status !== "pending") {
        servicePartnerId = faker.helpers.arrayElement(partners).id;
    }
    // Amount only if confirmed/completed
    if (["confirmed", "completed"].includes(status)) {
        amount = faker.number.float({
            min: 200,
            max: 5000,
            fractionDigits: 2,
        });
    }
    // Receipt only for completed
    if (status === "completed") {
        receiptUrl = faker.internet.url();
        serviceDuration = faker.number.int({ min: 30, max: 180 }); // minutes
    }
    return {
        servicePartnerId,
        amount,
        receiptUrl,
        serviceDuration,
    };
};
const generateBookings = (users, services, partners) => __awaiter(void 0, void 0, void 0, function* () {
    const bookings = [];
    for (let i = 0; i < 270; i++) {
        const user = faker.helpers.arrayElement(users);
        const service = faker.helpers.arrayElement(services);
        const status = faker.helpers.arrayElement(STATUSES);
        const dynamicFields = generateBookingFields(status, partners);
        bookings.push({
            userId: user.id,
            serviceId: service.id,
            status,
            bookingDate: getRandomDate(status),
            // ✅ NEW FIELDS
            servicePartnerId: dynamicFields.servicePartnerId,
            serviceDuration: dynamicFields.serviceDuration,
            serviceAddress: faker.location.streetAddress(),
            amount: dynamicFields.amount,
            receiptUrl: dynamicFields.receiptUrl,
            createdAt: new Date(),
            updatedAt: new Date(),
        });
    }
    return yield booking_model_1.Booking.bulkCreate(bookings);
});
const seed = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log("Seeding started...");
        yield db_1.default.sync({ force: true });
        const users = yield generateUsers();
        const serviceTypes = yield generateServiceTypes();
        const categories = yield generateCategories(serviceTypes);
        const subCategories = yield generateSubCategories(categories);
        const services = yield generateServices(categories, subCategories);
        const partners = yield generateServicePartners(users, serviceTypes);
        yield generateBookings(users, services, partners);
        console.log("Seeding completed successfully 🚀");
        process.exit();
    }
    catch (error) {
        console.error("Seeding error:", error);
        process.exit(1);
    }
});
seed();
