"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const asyncErrorHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};
exports.default = asyncErrorHandler;
