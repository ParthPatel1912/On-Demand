"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const sequelize_1 = require("sequelize");
const db_1 = __importDefault(require("../configs/db"));
class User extends sequelize_1.Model {
}
exports.User = User;
User.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    name: {
        type: sequelize_1.DataTypes.STRING(150),
        allowNull: false,
    },
    email: {
        type: sequelize_1.DataTypes.STRING(150),
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true,
        },
    },
    emailVerifiedAt: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true,
    },
    rememberToken: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
    },
    password: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    mobileNumber: {
        type: sequelize_1.DataTypes.STRING(20),
        allowNull: true,
    },
    roleId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
        field: 'role_id',
    },
    profileImage: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
        field: 'profile_image',
    },
    cloudinaryId: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
        field: 'cloudinary_id',
    },
    lastLoginAt: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true,
        field: 'last_login_at',
    },
    isActive: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
    },
    countryCode: {
        type: sequelize_1.DataTypes.STRING(10),
        allowNull: true,
    },
}, {
    tableName: "users",
    sequelize: db_1.default,
    underscored: true,
    paranoid: true,
});
exports.default = User;
