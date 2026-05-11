"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Service = void 0;
const sequelize_1 = require("sequelize");
const db_1 = __importDefault(require("../configs/db"));
class Service extends sequelize_1.Model {
}
exports.Service = Service;
Service.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    name: {
        type: sequelize_1.DataTypes.STRING(150),
        allowNull: false,
    },
    categoryId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
    },
    subCategoryId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
    },
    price: {
        type: sequelize_1.DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
    duration: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
    },
    commission: {
        type: sequelize_1.DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
    },
    availability: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
    },
    images: {
        type: sequelize_1.DataTypes.ARRAY(sequelize_1.DataTypes.TEXT),
        allowNull: false,
        defaultValue: [],
    },
    cloudinaryIds: {
        type: sequelize_1.DataTypes.ARRAY(sequelize_1.DataTypes.TEXT),
        allowNull: false,
        defaultValue: [],
    },
    includeServices: {
        type: sequelize_1.DataTypes.ARRAY(sequelize_1.DataTypes.TEXT),
        allowNull: false,
        defaultValue: [],
    },
    excludeServices: {
        type: sequelize_1.DataTypes.ARRAY(sequelize_1.DataTypes.TEXT),
        allowNull: false,
        defaultValue: [],
    },
}, {
    tableName: "services",
    sequelize: db_1.default,
    indexes: [
        { fields: ["category_id"] },
        { fields: ["sub_category_id"] },
        { fields: ["availability"] },
        { fields: ["price"] },
        { fields: ["commission"] },
    ],
    underscored: true
});
exports.default = Service;
