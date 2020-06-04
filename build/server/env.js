"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// common env reading for server & client
require('dotenv').config();
exports.default = (key = "") => {
    if (key === 'NODE_ENV') {
        return process.env.NODE_ENV;
    }
    let value = '';
    const serverKey = `SERVER_APP_${key}`;
    value = process.env[serverKey];
    if (!value) {
        const appKey = `REACT_APP_${key}`;
        value = process.env[appKey];
    }
    return value;
};
