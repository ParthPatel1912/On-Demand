"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorResponse = exports.SendResponse = void 0;
const SendResponse = (response, statusCode, data, message, meta) => {
    let responseJson = {};
    if (data) {
        responseJson = Object.assign(Object.assign({}, responseJson), { data: data, message: message || "" });
    }
    if (meta) {
        responseJson = Object.assign(Object.assign({}, responseJson), { meta: meta });
    }
    responseJson = Object.assign(Object.assign({}, responseJson), { message: message || "" });
    return response.status(statusCode).json(responseJson);
};
exports.SendResponse = SendResponse;
const ErrorResponse = (response, statusCode, error) => {
    let responseJson = {};
    responseJson = Object.assign(Object.assign({}, responseJson), { error: error || "" });
    return response.status(statusCode).json(responseJson);
};
exports.ErrorResponse = ErrorResponse;
