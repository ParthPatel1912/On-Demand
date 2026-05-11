"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sanitizeWithDOMPurify = void 0;
const dompurify_1 = __importDefault(require("dompurify"));
const jsdom_1 = require("jsdom");
const window = new jsdom_1.JSDOM("").window;
const DOMPurify = (0, dompurify_1.default)(window);
const sanitizeWithDOMPurify = (data) => {
    if (typeof data === "string") {
        return DOMPurify.sanitize(data);
    }
    if (Array.isArray(data)) {
        return data.map(exports.sanitizeWithDOMPurify);
    }
    if (typeof data === "object" && data !== null) {
        const obj = {};
        for (const key in data) {
            obj[key] = (0, exports.sanitizeWithDOMPurify)(data[key]);
        }
        return obj;
    }
    return data;
};
exports.sanitizeWithDOMPurify = sanitizeWithDOMPurify;
