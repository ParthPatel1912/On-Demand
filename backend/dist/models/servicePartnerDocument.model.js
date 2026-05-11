"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServicePartnerDocument = void 0;
const sequelize_1 = require("sequelize");
const db_1 = __importDefault(require("../configs/db"));
class ServicePartnerDocument extends sequelize_1.Model {
}
exports.ServicePartnerDocument = ServicePartnerDocument;
ServicePartnerDocument.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    partnerId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
    },
    documentUrl: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    documentName: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    size: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    cloudinaryId: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
}, {
    tableName: "service_partner_documents",
    sequelize: db_1.default,
    underscored: true,
});
