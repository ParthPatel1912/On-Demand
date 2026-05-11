"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const db_1 = __importDefault(require("../configs/db"));
class CouponUsage extends sequelize_1.Model {
}
CouponUsage.init({
    id: {
        type: sequelize_1.DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
    },
    offerId: {
        type: sequelize_1.DataTypes.BIGINT,
        allowNull: false,
        field: "offer_id",
    },
    userId: {
        type: sequelize_1.DataTypes.BIGINT,
        allowNull: true,
        field: "user_id",
    },
    createdAt: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
        field: "created_at",
    },
    updatedAt: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
        field: "updated_at",
    },
}, {
    tableName: "coupon_usages",
    sequelize: db_1.default,
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    indexes: [
        {
            fields: ["offer_id"],
        },
        {
            fields: ["user_id"],
        },
        {
            fields: ["created_at"],
        },
    ],
});
exports.default = CouponUsage;
