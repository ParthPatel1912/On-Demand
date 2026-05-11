"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServicePartnerExperience = void 0;
const sequelize_1 = require("sequelize");
const db_1 = __importDefault(require("../configs/db"));
class ServicePartnerExperience extends sequelize_1.Model {
}
exports.ServicePartnerExperience = ServicePartnerExperience;
ServicePartnerExperience.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    partnerId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
    },
    companyName: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: true,
    },
    role: {
        type: sequelize_1.DataTypes.STRING(150),
        allowNull: true,
    },
    from: {
        type: sequelize_1.DataTypes.STRING(50),
        allowNull: true,
    },
    to: {
        type: sequelize_1.DataTypes.STRING(50),
        allowNull: true,
    },
}, {
    tableName: "service_partner_experiences",
    sequelize: db_1.default,
    underscored: true,
});
