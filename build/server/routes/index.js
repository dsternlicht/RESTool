"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ping_1 = __importDefault(require("./ping"));
const config_1 = __importDefault(require("./config"));
const routes = module.exports;
routes.mapRoutes = (app) => {
    /* APIs and Routes */
    app.use('/ping', ping_1.default);
    app.use('/remote', config_1.default);
    return app;
};
exports.default = routes;
