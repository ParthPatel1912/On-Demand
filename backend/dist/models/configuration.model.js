"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const db_1 = __importDefault(require("../configs/db"));
class Configuration extends sequelize_1.Model {
    // Helper method to get typed value
    getTypedValue() {
        switch (this.valueType) {
            case 'number':
                return Number(this.value);
            case 'boolean':
                return this.value.toLowerCase() === 'true';
            case 'json':
                try {
                    return JSON.parse(this.value);
                }
                catch (_a) {
                    return this.value;
                }
            case 'date':
                return new Date(this.value);
            default:
                return this.value;
        }
    }
    // Helper method to set typed value
    setTypedValue(value) {
        this.value = typeof value === 'object' ? JSON.stringify(value) : String(value);
    }
}
Configuration.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
    },
    configKey: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: false,
        unique: true,
        validate: {
            notEmpty: true,
        },
    },
    name: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: false,
        validate: {
            notEmpty: true,
        },
    },
    value: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: false,
        validate: {
            notEmpty: true,
        },
    },
    valueType: {
        type: sequelize_1.DataTypes.ENUM('string', 'number', 'boolean', 'json', 'date'),
        allowNull: false,
        defaultValue: 'string',
    },
    description: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
    },
    isActive: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
    },
    createdAt: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
    },
    updatedAt: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
    },
}, {
    tableName: 'configurations',
    sequelize: db_1.default,
    timestamps: true,
    indexes: [
        {
            fields: ['configKey'],
            unique: true,
        },
        {
            fields: ['name'],
        },
        {
            fields: ['isActive'],
        },
    ],
});
exports.default = Configuration;
