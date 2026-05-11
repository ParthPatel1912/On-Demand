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
exports.serviceTypeRepository = void 0;
const models_1 = require("../models");
/**
 * Repository for ServiceType model operations.
 */
exports.serviceTypeRepository = {
    /**
     * Find a service type by its primary key.
     */
    findById: (id, include) => {
        return models_1.ServiceType.findByPk(id, {
            include,
        });
    },
    /**
     * Find a service type by its name.
     */
    findByName: (name) => {
        return models_1.ServiceType.findOne({
            where: { name },
            attributes: { exclude: ["cloudinaryId", "bannerCloudinaryId"] }
        });
    },
    /**
     * Find all service types with pagination and custom order.
     */
    findAll: (options) => {
        return models_1.ServiceType.findAll(Object.assign(Object.assign({}, options), { attributes: options.attributes || { exclude: ["cloudinaryId", "bannerCloudinaryId"] } }));
    },
    /**
     * Find and count all service types for pagination.
     */
    findAndCountAll: (options) => {
        return models_1.ServiceType.findAndCountAll(Object.assign(Object.assign({}, options), { attributes: { exclude: ["cloudinaryId", "bannerCloudinaryId"] } }));
    },
    /**
     * Create a new service type.
     */
    create: (data) => {
        return models_1.ServiceType.create(data);
    },
    /**
     * Update an existing service type.
     */
    update: (id, data) => __awaiter(void 0, void 0, void 0, function* () {
        const item = yield models_1.ServiceType.findByPk(id);
        if (item) {
            return item.update(data);
        }
        return null;
    }),
    /**
     * Delete a service type.
     */
    delete: (id) => __awaiter(void 0, void 0, void 0, function* () {
        const item = yield models_1.ServiceType.findByPk(id);
        if (item) {
            return item.destroy();
        }
        return null;
    }),
};
