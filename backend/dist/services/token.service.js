"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getExpiresIn = exports.verifyToken = exports.generateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN_SECONDS = Number(process.env.JWT_EXPIRES_IN) || 28800; // 8 hours
/**
 * Generate a signed JWT for a customer.
 */
const generateToken = (payload) => {
    return jsonwebtoken_1.default.sign(payload, JWT_SECRET, {
        expiresIn: JWT_EXPIRES_IN_SECONDS,
    });
};
exports.generateToken = generateToken;
/**
 * Verify a JWT and return the decoded payload.
 * Throws if invalid or expired.
 */
const verifyToken = (token) => {
    return jsonwebtoken_1.default.verify(token, JWT_SECRET);
};
exports.verifyToken = verifyToken;
/**
 * How long the token is valid for (in seconds) — used in API responses.
 */
const getExpiresIn = () => JWT_EXPIRES_IN_SECONDS;
exports.getExpiresIn = getExpiresIn;
