"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// common env reading for server & client
function isBrowser() {
    return !!(typeof window !== "undefined" && window['_env']);
}
function env(key = "") {
    if (isBrowser() && key === "NODE_ENV") {
        return window['_env'].NODE_ENV;
    }
    if (isBrowser()) {
        const safeKey = `REACT_APP_${key}`;
        return key.length ? window['_env'][safeKey] : window['_env'];
    }
    if (key === 'NODE_ENV') {
        return process.env.NODE_ENV;
    }
    require('dotenv').config();
    const safeKey = `SERVER_APP_${key}`;
    return process.env[safeKey];
}
exports.default = env;
