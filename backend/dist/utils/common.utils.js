"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getErrorMessage = exports.roundUpToNextQuarter = exports.humanizeString = exports.futureSevenDayLimit = exports.parseBookingDate = exports.parseJsonArray = exports.parseAvailability = exports.parseNumber = exports.parseStringArray = void 0;
const enums_1 = require("../enums");
/**
 * Converts input into a clean string array.
 * Supports:
 * - Array input
 * - JSON string array (e.g. '["a","b"]')
 * - Comma-separated string (e.g. 'a,b,c')
 */
const parseStringArray = (value) => {
    if (value == null)
        return undefined;
    // If already an array
    if (Array.isArray(value)) {
        return value.map((v) => String(v).trim()).filter(Boolean);
    }
    if (typeof value !== "string")
        return undefined;
    const str = value.trim();
    if (!str || str === "[]")
        return [];
    // Try parsing JSON array
    if (str.startsWith("[")) {
        try {
            const parsed = JSON.parse(str);
            if (Array.isArray(parsed)) {
                return parsed.map((v) => String(v).trim()).filter(Boolean);
            }
        }
        catch (_a) {
            // fallback to CSV parsing
        }
    }
    // Fallback: comma-separated string
    return str
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
};
exports.parseStringArray = parseStringArray;
/**
 * Safely converts input into a number.
 * Returns undefined for invalid or empty values.
 */
const parseNumber = (value) => {
    const num = Number(value);
    return value == null || value === "" || !Number.isFinite(num)
        ? undefined
        : num;
};
exports.parseNumber = parseNumber;
/**
 * Converts input into boolean.
 * Supports: yes/no, true/false, 1/0 (case-insensitive)
 */
const parseAvailability = (value) => {
    if (value == null || value === "")
        return undefined;
    const v = String(value).toLowerCase();
    if (Object.values(enums_1.TrueValues).includes(v))
        return true;
    if (Object.values(enums_1.FalseValues).includes(v))
        return false;
    return undefined;
};
exports.parseAvailability = parseAvailability;
/**
 * Safely parses a JSON array from a string or returns the array itself.
 */
const parseJsonArray = (value) => {
    if (value == null)
        return undefined;
    if (Array.isArray(value))
        return value;
    if (typeof value !== "string")
        return undefined;
    const str = value.trim();
    if (!str || str === "[]")
        return [];
    try {
        const parsed = JSON.parse(str);
        return Array.isArray(parsed) ? parsed : undefined;
    }
    catch (_a) {
        return undefined;
    }
};
exports.parseJsonArray = parseJsonArray;
const parseBookingDate = (date, time) => {
    const [year, month, day] = date.split("-").map(Number);
    const match = /^(\d{1,2}):(\d{2})\s?(AM|PM)$/i.exec(time);
    if (!match)
        throw new Error("Invalid time format");
    let [_, h, m, p] = match;
    let hours = Number(h);
    const minutes = Number(m);
    if (p.toUpperCase() === "PM" && hours !== 12)
        hours += 12;
    if (p.toUpperCase() === "AM" && hours === 12)
        hours = 0;
    return new Date(year, month - 1, day, hours, minutes);
};
exports.parseBookingDate = parseBookingDate;
exports.futureSevenDayLimit = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
exports.humanizeString = (() => {
    const UNDERSCORE = /_/g;
    const WORD_BOUNDARY = /\b\w/g;
    return (str) => {
        if (!str)
            return "";
        return str
            .toLowerCase()
            .replace(UNDERSCORE, " ")
            .replace(WORD_BOUNDARY, (c) => c.toUpperCase());
    };
})();
const roundUpToNextQuarter = (date) => {
    const rounded = new Date(date);
    const minutes = rounded.getMinutes();
    const remainder = minutes % 15;
    if (remainder !== 0) {
        rounded.setMinutes(minutes + (15 - remainder));
    }
    // Handle overflow (e.g., 46 → next hour)
    if (rounded.getMinutes() === 60) {
        rounded.setHours(rounded.getHours() + 1);
        rounded.setMinutes(0);
    }
    rounded.setSeconds(0);
    rounded.setMilliseconds(0);
    return rounded;
};
exports.roundUpToNextQuarter = roundUpToNextQuarter;
const getErrorMessage = (error) => error instanceof Error ? error.message : String(error);
exports.getErrorMessage = getErrorMessage;
