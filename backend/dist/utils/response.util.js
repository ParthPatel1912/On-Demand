"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendError = exports.sendResponse = void 0;
const enums_1 = require("../enums");
/**
 * @name sendResponse
 * @description
 * Standard API Response (Unified Helper)
 * Helper to send API responses in a consistent format across the application.
 * Supports both success and error responses with flexible parameters.
 * @access Public
 */
const sendResponse = (res, messageOrParams = null, data, statusCode = enums_1.STATUS_CODE.OK, extra = {}) => {
    var _a;
    let params;
    if (typeof messageOrParams === "object" && messageOrParams !== null) {
        params = messageOrParams;
    }
    else {
        params = Object.assign({ message: messageOrParams, data,
            statusCode }, extra);
    }
    const { statusCode: finalStatusCode = params.statusCode || enums_1.STATUS_CODE.OK, success = (_a = params.success) !== null && _a !== void 0 ? _a : (finalStatusCode >= enums_1.STATUS_CODE.OK && finalStatusCode < enums_1.STATUS_CODE.BAD_REQUEST), message, data: finalData, meta, pagination, error } = params, rest = __rest(params, ["statusCode", "success", "message", "data", "meta", "pagination", "error"]);
    const responseJson = Object.assign({ success, message: message || undefined, data: finalData === undefined ? undefined : finalData, meta,
        pagination,
        error }, rest);
    // Remove undefined fields
    Object.keys(responseJson).forEach((key) => {
        if (responseJson[key] === undefined)
            delete responseJson[key];
    });
    return res.status(finalStatusCode).json(responseJson);
};
exports.sendResponse = sendResponse;
/**
 * @name sendError
 * @description
 * Helper to send error responses in a consistent format. Can be used for both expected and unexpected errors.
 * @access Public
 */
const sendError = (res, message, statusCode = enums_1.STATUS_CODE.INTERNAL_SERVER_ERROR, extra = {}) => {
    return (0, exports.sendResponse)(res, Object.assign({ statusCode, success: false, message, error: message }, extra));
};
exports.sendError = sendError;
