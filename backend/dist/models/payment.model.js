"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Payment = void 0;
const sequelize_1 = require("sequelize");
const db_1 = __importDefault(require("../configs/db"));
const transaction_enum_1 = require("../enums/transaction.enum");
class Payment extends sequelize_1.Model {
}
exports.Payment = Payment;
Payment.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    userId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
    },
    serviceId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
    },
    addressId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
    },
    servicePartnerId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
        defaultValue: null,
    },
    slot: {
        type: sequelize_1.DataTypes.JSONB,
        allowNull: false,
        validate: {
            isValidSlot(value) {
                if (!value || typeof value !== "object")
                    throw new Error("Invalid slot");
                const slotValue = value;
                if (typeof slotValue.date !== "string" ||
                    typeof slotValue.time !== "string") {
                    throw new TypeError("Invalid slot");
                }
            },
        },
    },
    totalAmount: {
        type: sequelize_1.DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
            isDecimal: true,
            min: 0,
        },
    },
    amount: {
        type: sequelize_1.DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
            isDecimal: true,
            min: 0,
        },
    },
    tax: {
        type: sequelize_1.DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
            isDecimal: true,
            min: 0,
        },
    },
    discount: {
        type: sequelize_1.DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
        validate: {
            isDecimal: true,
            min: 0,
        },
    },
    currency: {
        type: sequelize_1.DataTypes.STRING(10),
        allowNull: false,
        defaultValue: "INR",
        validate: {
            len: [3, 10],
        },
        set(value) {
            this.setDataValue("currency", (value === null || value === void 0 ? void 0 : value.trim().toUpperCase()) || "INR");
        },
    },
    couponId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
    },
    paymentMethod: {
        type: sequelize_1.DataTypes.ENUM(...Object.values(transaction_enum_1.PaymentMethod)),
        allowNull: false,
    },
    paymentStatus: {
        type: sequelize_1.DataTypes.ENUM(...Object.values(transaction_enum_1.PaymentStatus)),
        allowNull: false,
        defaultValue: transaction_enum_1.PaymentStatus.PENDING,
    },
    bookingStatus: {
        type: sequelize_1.DataTypes.ENUM(...Object.values(transaction_enum_1.BookingStatus)),
        allowNull: false,
        defaultValue: transaction_enum_1.BookingStatus.PENDING,
    },
    paymentGateway: {
        type: sequelize_1.DataTypes.ENUM(...Object.values(transaction_enum_1.PaymentGateway)),
        allowNull: true,
        field: "payment_gateway",
    },
    orderId: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: true,
        field: "order_id",
    },
    sessionId: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: true,
        field: "session_id",
    },
    paymentIntentId: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: true,
        field: "payment_intent_id",
    },
    clientSecret: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: true,
        field: "client_secret",
    },
    paidAt: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true,
    },
}, {
    tableName: "payments",
    sequelize: db_1.default,
    underscored: true,
    indexes: [
        { fields: ["user_id"] },
        { fields: ["service_id"] },
        { fields: ["service_partner_id"] },
        { fields: ["payment_status"] },
        { fields: ["booking_status"] },
        { fields: ["payment_method"] },
        { fields: ["slot"] },
        { fields: ["created_at"] },
        { fields: ["session_id"] },
        { fields: ["order_id"] },
        { fields: ["payment_gateway"] },
        { fields: ["payment_intent_id"] },
    ],
});
exports.default = Payment;
