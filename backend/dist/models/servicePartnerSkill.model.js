"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServicePartnerSkill = void 0;
const sequelize_1 = require("sequelize");
const db_1 = __importDefault(require("../configs/db"));
class ServicePartnerSkill extends sequelize_1.Model {
}
exports.ServicePartnerSkill = ServicePartnerSkill;
ServicePartnerSkill.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    partnerId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
    },
    categoryId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
    },
}, {
    tableName: "service_partner_skills",
    sequelize: db_1.default,
    underscored: true,
});
