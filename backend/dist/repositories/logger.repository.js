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
Object.defineProperty(exports, "__esModule", { value: true });
exports.findEventTypesCount = exports.findAndCountAllLogs = exports.createLogEvent = void 0;
const sequelize_1 = require("sequelize");
const models_1 = require("../models");
const createLogEvent = (data) => __awaiter(void 0, void 0, void 0, function* () {
    return yield models_1.Log.create(data);
});
exports.createLogEvent = createLogEvent;
const findAndCountAllLogs = (options) => __awaiter(void 0, void 0, void 0, function* () {
    return yield models_1.Log.findAndCountAll(Object.assign(Object.assign({}, options), { include: [{ model: models_1.User, as: "user", attributes: ["name", "email"] }] }));
});
exports.findAndCountAllLogs = findAndCountAllLogs;
const findEventTypesCount = (where) => __awaiter(void 0, void 0, void 0, function* () {
    return yield models_1.Log.findAll({
        attributes: [
            ["event_type", "eventType"],
            [(0, sequelize_1.fn)("COUNT", (0, sequelize_1.col)("event_type")), "count"],
        ],
        where,
        group: ["event_type"],
        order: [[(0, sequelize_1.literal)("count"), "DESC"]],
        raw: true,
    });
});
exports.findEventTypesCount = findEventTypesCount;
