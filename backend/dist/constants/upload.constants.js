"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ALLOWED_IMAGE_AND_DOC_TYPES = exports.MAX_FILES_COUNT = exports.MAX_FILE_SIZE = exports.IMAGE_FILE_SIZE = void 0;
exports.IMAGE_FILE_SIZE = 2 * 1024 * 1024; // 2MB
exports.MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
exports.MAX_FILES_COUNT = 200;
exports.ALLOWED_IMAGE_AND_DOC_TYPES = [
    "image/jpeg",
    "image/png",
    "image/svg+xml",
    "image/webp",
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];
