"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseBodyJson = exports.partnerDataParser = void 0;
const common_utils_1 = require("../utils/common.utils");
/**
 * Middleware to parse stringified JSON arrays and numbers from FormData.
 * This should be placed AFTER multer but BEFORE validation.
 */
const partnerDataParser = (req, _res, next) => {
    var _a;
    if (req.body) {
        // Parse arrays
        if (req.body.education)
            req.body.education = (0, common_utils_1.parseJsonArray)(req.body.education);
        if (req.body.professional)
            req.body.professional = (0, common_utils_1.parseJsonArray)(req.body.professional);
        if (req.body.skills)
            req.body.skills = (0, common_utils_1.parseJsonArray)(req.body.skills);
        if (req.body.servicesOffered)
            req.body.servicesOffered = (0, common_utils_1.parseJsonArray)(req.body.servicesOffered);
        if (req.body.languages)
            req.body.languages = (0, common_utils_1.parseJsonArray)(req.body.languages);
        // Parse numbers
        if (req.body.applyingFor) {
            const raw = req.body.applyingFor;
            req.body.applyingFor = Array.isArray(raw)
                ? raw.map(Number)
                : ((_a = (0, common_utils_1.parseJsonArray)(raw)) !== null && _a !== void 0 ? _a : []).map(Number);
        }
    }
    next();
};
exports.partnerDataParser = partnerDataParser;
/**
 * Middleware factory to parse a stringified JSON array from a request body field.
 * Useful for multipart/form-data where arrays are sent as JSON strings.
 * @param fieldName The name of the field to parse
 */
const parseBodyJson = (fieldName) => {
    return (req, _res, next) => {
        // If the entire body is an array (common in raw JSON requests like Postman),
        // wrap it into the expected field name so validation and controllers work.
        if (Array.isArray(req.body)) {
            req.body = { [fieldName]: req.body };
            return next();
        }
        if (req.body[fieldName] && typeof req.body[fieldName] === 'string') {
            try {
                req.body[fieldName] = (0, common_utils_1.parseJsonArray)(req.body[fieldName]);
            }
            catch (error) {
                // We let the validation middleware or controller handle empty/invalid data later
            }
        }
        next();
    };
};
exports.parseBodyJson = parseBodyJson;
