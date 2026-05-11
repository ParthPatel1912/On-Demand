"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServicePartnerService = void 0;
const sequelize_1 = require("sequelize");
const db_1 = __importDefault(require("../configs/db"));
class ServicePartnerService extends sequelize_1.Model {
}
exports.ServicePartnerService = ServicePartnerService;
ServicePartnerService.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    partnerId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
    },
    subCategoryId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
    },
}, {
    tableName: "service_partner_services",
    sequelize: db_1.default,
    underscored: true,
});
