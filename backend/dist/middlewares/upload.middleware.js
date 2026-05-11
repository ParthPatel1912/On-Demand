"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.imageUpload = exports.upload = void 0;
const multer_1 = __importDefault(require("multer"));
const os_1 = __importDefault(require("os"));
const apiError_util_1 = require("../utils/apiError.util");
const messages_1 = require("../constants/messages");
const enums_1 = require("../enums");
const constants_1 = require("../constants");
const storage = multer_1.default.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, os_1.default.tmpdir());
    },
    filename: (_req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    },
});
exports.upload = (0, multer_1.default)({
    storage,
    limits: {
        fileSize: constants_1.MAX_FILE_SIZE,
        files: constants_1.MAX_FILES_COUNT,
    },
    fileFilter: (_req, file, cb) => {
        const allowedTypes = constants_1.ALLOWED_IMAGE_AND_DOC_TYPES;
        if (!allowedTypes.includes(file.mimetype)) {
            return cb(new apiError_util_1.ApiError(enums_1.STATUS_CODE.BAD_REQUEST, messages_1.MESSAGES.COMMON.ONLY_IMAGES_PDFS_AND_WORD_DOCS_ALLOWED), false);
        }
        cb(null, true);
    },
});
exports.imageUpload = (0, multer_1.default)({
    storage,
    limits: {
        fileSize: constants_1.IMAGE_FILE_SIZE,
    },
    fileFilter: (_req, file, cb) => {
        const allowedTypes = ["image/jpeg", "image/png", "image/svg+xml"];
        if (!allowedTypes.includes(file.mimetype)) {
            return cb(new apiError_util_1.ApiError(enums_1.STATUS_CODE.BAD_REQUEST, messages_1.MESSAGES.COMMON.ONLY_IMAGES_JPG_PNG_AND_SVG_ALLOWED), false);
        }
        cb(null, true);
    },
});
