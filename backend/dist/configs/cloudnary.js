"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CLOUDINARY_FOLDERS = void 0;
const cloudinary_1 = require("cloudinary");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
cloudinary_1.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});
// Centralized folder names
exports.CLOUDINARY_FOLDERS = {
    SERVICE_TYPE: `${process.env.CLOUDINARY_FOLDER}/service-types`,
    SERVICE: `${process.env.CLOUDINARY_FOLDER}/services`,
    SERVICE_PARTNER: `${process.env.CLOUDINARY_FOLDER}/service_partners`,
};
exports.default = cloudinary_1.v2;
