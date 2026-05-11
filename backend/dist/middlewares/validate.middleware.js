"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = void 0;
const sanitizeWithDOMPurify_1 = require("../utils/sanitizeWithDOMPurify");
const validate = (schema) => {
    return (req, _res, next) => {
        var _a;
        // Normalize common multipart "array field" naming (`field[]`) into `field`
        // so clients can use either style.
        const normalizedBody = Object.assign({}, ((_a = req.body) !== null && _a !== void 0 ? _a : {}));
        for (const key of Object.keys(normalizedBody)) {
            if (!key.endsWith("[]"))
                continue;
            const baseKey = key.slice(0, -2);
            const value = normalizedBody[key];
            delete normalizedBody[key];
            const incomingValues = Array.isArray(value) ? value : [value];
            const existing = normalizedBody[baseKey];
            const existingValues = existing === undefined
                ? []
                : Array.isArray(existing)
                    ? existing
                    : [existing];
            normalizedBody[baseKey] = [...existingValues, ...incomingValues];
        }
        // Combine body, file, and files into a single validation object
        const dataToValidate = Object.assign(Object.assign(Object.assign({}, normalizedBody), (req.file ? { [req.file.fieldname]: req.file } : {})), (Array.isArray(req.files)
            ? req.files.length
                ? { [req.files[0].fieldname]: req.files }
                : {}
            : Object.keys(req.files || {}).reduce((acc, key) => {
                acc[key] = req.files[key];
                return acc;
            }, {})));
        const { error, value } = schema.validate(dataToValidate, { abortEarly: false });
        if (error) {
            error.message = "Validation failed.";
            return next(error);
        }
        const sanitizedData = (0, sanitizeWithDOMPurify_1.sanitizeWithDOMPurify)(value);
        req.body = sanitizedData;
        next();
    };
};
exports.validate = validate;
