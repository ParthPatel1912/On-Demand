"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const db_1 = __importDefault(require("../configs/db"));
class CustomerOtp extends sequelize_1.Model {
}
CustomerOtp.init({
    id: {
        type: sequelize_1.DataTypes.BIGINT,
        autoIncrement: true,
        primaryKey: true,
    },
    email: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: false,
    },
    otp: {
        type: sequelize_1.DataTypes.STRING(4),
        allowNull: false,
    },
    expires_at: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
    },
    name: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: true,
    },
}, {
    tableName: "user_otps",
    sequelize: db_1.default,
    underscored: true,
});
exports.default = CustomerOtp;
