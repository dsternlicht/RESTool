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
const express_1 = require("express");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const smcloudstore_1 = __importDefault(require("smcloudstore"));
const env_1 = __importDefault(require("../../env"));
const storageProvider = env_1.default('STORAGE_PROVIDER') || 'local';
const storagePath = env_1.default('STORAGE_PATH');
const storageContainer = env_1.default('STORAGE_CONTAINER');
const storageConnection = (env_1.default('STORAGE_CONNECTION') && JSON.parse(env_1.default('STORAGE_CONNECTION')));
let storage = null;
if (storageProvider !== 'local' && !(storageProvider !== undefined && storagePath !== undefined && storageContainer !== undefined && storageConnection !== undefined)) {
    throw Error("Valid args not found for storage provider");
}
else {
    storage = smcloudstore_1.default.Create(storageProvider, storageConnection);
}
let localConfigData = JSON.parse(fs_1.default.readFileSync(path_1.default.resolve(process.cwd(), 'public/config.json')).toString());
const configServer = express_1.Router();
// TODO: config.js support
configServer
    .get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let configString = {};
    if (storageProvider !== 'local') {
        configString = JSON.parse(yield storage.getObjectAsString(storageContainer, storagePath));
    }
    else {
        configString = localConfigData;
    }
    res.status(200).json(configString);
}));
exports.default = configServer;
