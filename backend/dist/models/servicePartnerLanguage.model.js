"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServicePartnerLanguage = void 0;
const sequelize_1 = require("sequelize");
const db_1 = __importDefault(require("../configs/db"));
class ServicePartnerLanguage extends sequelize_1.Model {
}
exports.ServicePartnerLanguage = ServicePartnerLanguage;
ServicePartnerLanguage.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    partnerId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
    },
    language: {
        type: sequelize_1.DataTypes.STRING(100),
        allowNull: false,
    },
    proficiency: {
        type: sequelize_1.DataTypes.ENUM('Beginner', 'Intermediate', 'Expert'),
        allowNull: false,
    },
}, {
    tableName: "service_partner_languages",
    sequelize: db_1.default,
    underscored: true,
});
