"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Log = void 0;
// src/models/Log.model.ts
const sequelize_1 = require("sequelize");
const db_1 = __importDefault(require("../configs/db"));
const log_enum_1 = require("../enums/log.enum");
class Log extends sequelize_1.Model {
}
exports.Log = Log;
Log.init({
    id: { type: sequelize_1.DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
    eventType: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    category: {
        type: sequelize_1.DataTypes.ENUM(...Object.values(log_enum_1.LogCategory)),
        allowNull: false,
    },
    message: { type: sequelize_1.DataTypes.TEXT, allowNull: false },
    userId: { type: sequelize_1.DataTypes.INTEGER, allowNull: true, field: "user_id" },
    serviceId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
        field: "service_id",
    },
    bookingId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
        field: "booking_id",
    },
    status: {
        type: sequelize_1.DataTypes.ENUM(...Object.values(log_enum_1.LogStatus)),
        allowNull: true,
    },
    metadata: {
        type: sequelize_1.DataTypes.JSONB,
        allowNull: true,
    },
}, {
    sequelize: db_1.default,
    tableName: "logs",
    underscored: true,
    timestamps: true,
    updatedAt: false,
    indexes: [
        { fields: ["event_type"] },
        { fields: ["category"] },
        { fields: ["user_id"] },
        { fields: ["created_at"] },
        { fields: ["booking_id"] },
        { fields: ["service_id"] },
        { fields: ["status"] },
    ],
});
exports.default = Log;
