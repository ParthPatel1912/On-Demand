"use strict";
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
exports.updateConfigurationValue = exports.getConfigurationByKey = exports.getConfigurations = void 0;
const configuration_model_1 = __importDefault(require("../models/configuration.model"));
const apiError_util_1 = require("../utils/apiError.util");
const logger_1 = __importDefault(require("../utils/logger"));
const messages_1 = require("../constants/messages");
const enums_1 = require("../enums");
/**
 * Get all Configurations
 */
const getConfigurations = () => __awaiter(void 0, void 0, void 0, function* () {
    logger_1.default.info("ConfigurationService: Fetching all configurations");
    return configuration_model_1.default.findAll({
        order: [["configKey", "ASC"]],
    });
});
exports.getConfigurations = getConfigurations;
/**
 * Get Configuration by configKey
 */
const getConfigurationByKey = (configKey) => __awaiter(void 0, void 0, void 0, function* () {
    logger_1.default.info(`ConfigurationService: Fetching configuration by key: ${configKey}`);
    const configuration = yield configuration_model_1.default.findOne({
        where: { configKey },
    });
    if (!configuration) {
        logger_1.default.warn(`Configuration not found with key: ${configKey}`);
        throw new apiError_util_1.ApiError(enums_1.STATUS_CODE.NOT_FOUND, messages_1.MESSAGES.CONFIGURATION.NOT_FOUND);
    }
    return configuration;
});
exports.getConfigurationByKey = getConfigurationByKey;
/**
 * Update Configuration value only
 */
const updateConfigurationValue = (id, value) => __awaiter(void 0, void 0, void 0, function* () {
    logger_1.default.info(`ConfigurationService: Updating configuration value for ID: ${id}`);
    const configuration = yield configuration_model_1.default.findByPk(id);
    if (!configuration) {
        logger_1.default.warn(`Configuration not found with ID: ${id}`);
        throw new apiError_util_1.ApiError(enums_1.STATUS_CODE.NOT_FOUND, messages_1.MESSAGES.CONFIGURATION.NOT_FOUND);
    }
    switch (configuration.valueType) {
        case 'number':
            const numValue = Number(value);
            if (isNaN(numValue)) {
                logger_1.default.warn(`Invalid number value provided for configuration ID: ${id}`);
                throw new apiError_util_1.ApiError(enums_1.STATUS_CODE.BAD_REQUEST, messages_1.MESSAGES.CONFIGURATION.INVALID_NUMBER);
            }
            value = numValue;
            break;
        case 'boolean':
            if (typeof value !== 'boolean' && typeof value !== 'string') {
                logger_1.default.warn(`Invalid boolean value provided for configuration ID: ${id}`);
                throw new apiError_util_1.ApiError(enums_1.STATUS_CODE.BAD_REQUEST, messages_1.MESSAGES.CONFIGURATION.INVALID_BOOLEAN);
            }
            if (typeof value === 'string') {
                const lowerValue = value.toLowerCase().trim();
                if (lowerValue !== 'true' && lowerValue !== 'false') {
                    logger_1.default.warn(`Invalid boolean string value provided for configuration ID: ${id}`);
                    throw new apiError_util_1.ApiError(enums_1.STATUS_CODE.BAD_REQUEST, messages_1.MESSAGES.CONFIGURATION.BOOLEAN_MUST_BE_TRUE_OR_FALSE);
                }
                value = lowerValue === 'true';
            }
            break;
        case 'json':
            if (typeof value !== 'object' && typeof value !== 'string') {
                logger_1.default.warn(`Invalid JSON value provided for configuration ID: ${id}`);
                throw new apiError_util_1.ApiError(enums_1.STATUS_CODE.BAD_REQUEST, messages_1.MESSAGES.CONFIGURATION.INVALID_JSON);
            }
            if (typeof value === 'string') {
                try {
                    JSON.parse(value);
                }
                catch (error) {
                    logger_1.default.warn(`Invalid JSON string provided for configuration ID: ${id}`);
                    throw new apiError_util_1.ApiError(enums_1.STATUS_CODE.BAD_REQUEST, messages_1.MESSAGES.CONFIGURATION.INVALID_JSON_STRING);
                }
            }
            break;
        case 'date':
            const dateValue = new Date(value);
            if (isNaN(dateValue.getTime())) {
                logger_1.default.warn(`Invalid date value provided for configuration ID: ${id}`);
                throw new apiError_util_1.ApiError(enums_1.STATUS_CODE.BAD_REQUEST, messages_1.MESSAGES.CONFIGURATION.INVALID_DATE);
            }
            value = dateValue;
            break;
        case 'string':
            if (typeof value !== 'string' && typeof value !== 'number') {
                logger_1.default.warn(`Invalid string value provided for configuration ID: ${id}`);
                throw new apiError_util_1.ApiError(enums_1.STATUS_CODE.BAD_REQUEST, messages_1.MESSAGES.CONFIGURATION.INVALID_STRING);
            }
            value = String(value);
            break;
        default:
            logger_1.default.warn(`Unknown valueType for configuration ID: ${id}`);
            throw new apiError_util_1.ApiError(enums_1.STATUS_CODE.BAD_REQUEST, messages_1.MESSAGES.CONFIGURATION.UNKNOWN_VALUE_TYPE);
    }
    configuration.setTypedValue(value);
    yield configuration.save();
    logger_1.default.info(`Configuration value updated for ID: ${id}`);
    return configuration;
});
exports.updateConfigurationValue = updateConfigurationValue;
