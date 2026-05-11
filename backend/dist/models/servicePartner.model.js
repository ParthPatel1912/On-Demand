"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServicePartner = void 0;
const sequelize_1 = require("sequelize");
const db_1 = __importDefault(require("../configs/db"));
const servicePartner_enum_1 = require("../enums/servicePartner.enum");
class ServicePartner extends sequelize_1.Model {
}
exports.ServicePartner = ServicePartner;
ServicePartner.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    userId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
    },
    dob: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
    },
    gender: {
        type: sequelize_1.DataTypes.ENUM('Male', 'Female'),
        allowNull: false,
    },
    serviceTypeIds: {
        type: sequelize_1.DataTypes.ARRAY(sequelize_1.DataTypes.INTEGER),
        allowNull: false,
        field: 'service_type_id',
    },
    permanentAddress: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
    },
    residentialAddress: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
    },
    verificationStatus: {
        type: sequelize_1.DataTypes.ENUM(...Object.values(servicePartner_enum_1.VerificationStatus)),
        allowNull: false,
        defaultValue: servicePartner_enum_1.VerificationStatus.PENDING,
    },
    status: {
        type: sequelize_1.DataTypes.ENUM(...Object.values(servicePartner_enum_1.ServicePartnerStatus)),
        allowNull: false,
        defaultValue: servicePartner_enum_1.ServicePartnerStatus.INACTIVE,
    },
}, {
    tableName: "service_partners",
    sequelize: db_1.default,
    underscored: true,
});
