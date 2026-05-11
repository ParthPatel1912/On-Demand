"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CLOUDINARY_FOLDERS = exports.deleteImage = exports.uploadImage = void 0;
const stream_1 = require("stream");
const fs_1 = __importDefault(require("fs"));
const cloudnary_1 = __importStar(require("../configs/cloudnary"));
Object.defineProperty(exports, "CLOUDINARY_FOLDERS", { enumerable: true, get: function () { return cloudnary_1.CLOUDINARY_FOLDERS; } });
const getResourceType = (file) => {
    if (typeof file !== "string" && file.mimetype) {
        if (file.mimetype.startsWith("image/"))
            return "image";
        if (file.mimetype.startsWith("video/"))
            return "video";
        return "raw"; // pdf, doc, csv, xml, etc.
    }
    return "raw";
};
const uploadImage = (file, folder) => __awaiter(void 0, void 0, void 0, function* () {
    return new Promise((resolve, reject) => {
        // Always treat SVG as image for display
        let resourceType = "raw";
        if (typeof file !== "string" && "mimetype" in file) {
            resourceType = getResourceType(file);
        }
        const uploadStream = cloudnary_1.default.uploader.upload_stream({ folder, resource_type: resourceType }, (error, result) => {
            if (error)
                return reject(error);
            resolve({ url: result.secure_url, publicId: result.public_id });
        });
        // Handle different file inputs
        if (typeof file === "string") {
            fs_1.default.createReadStream(file).pipe(uploadStream);
        }
        else if (file instanceof stream_1.Readable) {
            file.pipe(uploadStream);
        }
        else if (file.buffer) {
            uploadStream.end(file.buffer);
        }
        else if (file.path) {
            fs_1.default.createReadStream(file.path).pipe(uploadStream);
        }
        else {
            reject(new Error("Invalid file format: No buffer, path or stream found"));
        }
    });
});
exports.uploadImage = uploadImage;
const deleteImage = (publicId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield cloudnary_1.default.uploader.destroy(publicId, { resource_type: 'image' });
        return result;
    }
    catch (err) {
        throw new Error('Failed to delete image from Cloudinary');
    }
});
exports.deleteImage = deleteImage;
