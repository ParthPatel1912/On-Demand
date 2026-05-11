"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.io = exports.initSocket = void 0;
// src/socket/index.ts
const logger_1 = __importDefault(require("../utils/logger"));
const socket_io_1 = require("socket.io");
let io;
const initSocket = (server) => {
    exports.io = io = new socket_io_1.Server(server, {
        cors: { origin: "*" },
    });
    io.on("connection", (socket) => {
        logger_1.default.info(`Socket connected: ${socket.id}`);
        socket.on("JOIN_ADMIN", () => {
            socket.join("ADMIN");
        });
        socket.on("disconnect", () => {
            logger_1.default.info(`Socket disconnected: ${socket.id}`);
        });
    });
    return io;
};
exports.initSocket = initSocket;
