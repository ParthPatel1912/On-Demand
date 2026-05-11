"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServiceType = void 0;
const sequelize_1 = require("sequelize");
const db_1 = __importDefault(require("../configs/db"));
class ServiceType extends sequelize_1.Model {
}
exports.ServiceType = ServiceType;
ServiceType.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    name: {
        type: sequelize_1.DataTypes.STRING(100),
        allowNull: false,
        unique: true,
    },
    image: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    cloudinaryId: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    bannerImage: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    bannerCloudinaryId: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
}, {
    tableName: "service_types",
    sequelize: db_1.default,
    underscored: true,
});
exports.default = ServiceType;
