"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Category = void 0;
const sequelize_1 = require("sequelize");
const db_1 = __importDefault(require("../configs/db"));
class Category extends sequelize_1.Model {
}
exports.Category = Category;
Category.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    name: {
        type: sequelize_1.DataTypes.STRING(100),
        allowNull: false,
    },
    serviceTypeId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
    },
    imageUrl: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: false,
    },
    cloudinaryId: {
        type: sequelize_1.DataTypes.STRING(100),
        allowNull: true,
    },
}, {
    tableName: "categories",
    sequelize: db_1.default,
    underscored: true,
    indexes: [
        {
            unique: true,
            fields: ['name', 'service_type_id']
        }
    ]
});
exports.default = Category;
