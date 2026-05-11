"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Offer = void 0;
const sequelize_1 = require("sequelize");
const db_1 = __importDefault(require("../configs/db"));
class Offer extends sequelize_1.Model {
}
exports.Offer = Offer;
Offer.init({
    id: {
        type: sequelize_1.DataTypes.BIGINT,
        autoIncrement: true,
        primaryKey: true,
    },
    couponCode: {
        type: sequelize_1.DataTypes.STRING(50),
        allowNull: false,
    },
    couponDescription: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
    },
    discountPercentage: {
        type: sequelize_1.DataTypes.DECIMAL(5, 2),
        allowNull: false,
        defaultValue: 0,
    },
    maxUsage: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0,
    },
    usedCount: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0,
    },
    isActive: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
    },
    deletedAt: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true,
    },
}, {
    tableName: "offers",
    sequelize: db_1.default,
    indexes: [
        {
            unique: true,
            fields: ["coupon_code"],
            where: {
                deleted_at: null,
            },
        },
        {
            fields: ["coupon_code", "is_active"],
        },
    ],
    underscored: true,
    timestamps: true,
    paranoid: true,
});
exports.default = Offer;
