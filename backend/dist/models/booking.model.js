"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Booking = void 0;
const sequelize_1 = require("sequelize");
const db_1 = __importDefault(require("../configs/db"));
const transaction_enum_1 = require("../enums/transaction.enum");
class Booking extends sequelize_1.Model {
}
exports.Booking = Booking;
Booking.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    paymentId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
    },
    serviceId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
    },
    serviceTypeId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
    },
    servicePartnerId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
    },
    userId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
    },
    status: {
        type: sequelize_1.DataTypes.ENUM(...Object.values(transaction_enum_1.BookingStatus)),
        defaultValue: transaction_enum_1.BookingStatus.PENDING,
    },
    bookingDate: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
    },
    serviceDuration: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
    },
    serviceAddress: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    amount: {
        type: sequelize_1.DataTypes.DECIMAL(10, 2),
        allowNull: true,
    },
    receiptUrl: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    cancellationReason: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
        defaultValue: null,
    },
    expiresAt: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true,
    },
}, {
    tableName: "bookings",
    sequelize: db_1.default,
    underscored: true,
    indexes: [
        { fields: ["service_id"] },
        { fields: ["service_type_id"] },
        { fields: ["status"] },
        { fields: ["service_partner_id"] },
        { fields: ["payment_id"] },
    ],
});
exports.default = Booking;
