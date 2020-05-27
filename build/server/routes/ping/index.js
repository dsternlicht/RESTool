"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const pingServer = express_1.Router();
pingServer
    .get('/ping', (req, res) => {
    res.status(200).json({ 'ping': 'pong', 'version': process.env.npm_package_version });
});
exports.default = pingServer;
