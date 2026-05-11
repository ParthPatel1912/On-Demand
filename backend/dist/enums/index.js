"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.STATUS_CODE = exports.FalseValues = exports.TrueValues = void 0;
var TrueValues;
(function (TrueValues) {
    TrueValues["YES"] = "yes";
    TrueValues["TRUE"] = "true";
    TrueValues["ONE"] = "1";
})(TrueValues || (exports.TrueValues = TrueValues = {}));
var FalseValues;
(function (FalseValues) {
    FalseValues["NO"] = "no";
    FalseValues["FALSE"] = "false";
    FalseValues["ZERO"] = "0";
})(FalseValues || (exports.FalseValues = FalseValues = {}));
exports.STATUS_CODE = Object.freeze({
    OK: 200,
    CREATED: 201,
    UPDATED: 204,
    NOT_FOUND: 404,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    CONFLICT: 409,
    TOO_MANY_REQUESTS: 429,
    INTERNAL_SERVER_ERROR: 500,
    SERVICE_NOT_ACTIVE: 503
});
