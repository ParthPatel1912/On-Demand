"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Address = void 0;
const sequelize_1 = require("sequelize");
const db_1 = __importDefault(require("../configs/db"));
class Address extends sequelize_1.Model {
}
exports.Address = Address;
Address.init({
    id: {
        type: sequelize_1.DataTypes.BIGINT,
        autoIncrement: true,
        primaryKey: true,
    },
    userId: {
        type: sequelize_1.DataTypes.BIGINT,
        allowNull: false,
    },
    label: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: false,
    },
    houseFlatNumber: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: false,
    },
    landmark: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: true,
        defaultValue: null,
    },
    address: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: false,
    },
    latitude: {
        type: sequelize_1.DataTypes.DECIMAL(10, 8),
        allowNull: true,
        defaultValue: null,
    },
    longitude: {
        type: sequelize_1.DataTypes.DECIMAL(11, 8),
        allowNull: true,
        defaultValue: null,
    },
    customLabel: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: true,
        defaultValue: null,
    },
}, {
    tableName: "addresses",
    sequelize: db_1.default,
    underscored: true,
    indexes: [{ fields: ["user_id"] }],
});
exports.default = Address;
