"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubCategory = void 0;
const sequelize_1 = require("sequelize");
const db_1 = __importDefault(require("../configs/db"));
class SubCategory extends sequelize_1.Model {
}
exports.SubCategory = SubCategory;
SubCategory.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    name: {
        type: sequelize_1.DataTypes.STRING(100),
        allowNull: false,
    },
    categoryId: {
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
    tableName: "sub_categories",
    sequelize: db_1.default,
    underscored: true,
    indexes: [
        {
            unique: true,
            fields: ['name', 'category_id']
        }
    ]
});
exports.default = SubCategory;
