"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const body_parser_1 = __importDefault(require("body-parser"));
const routes_1 = __importDefault(require("./routes"));
const isProd = process.env.NODE_ENV === 'production';
let app = express_1.default();
app.set('port', process.env.PORT || 1729);
app.use(cors_1.default());
app.use(body_parser_1.default.urlencoded({ extended: false }));
app = routes_1.default.mapRoutes(app);
console.log(path_1.default.join(process.cwd(), 'build'));
if (isProd) {
    app.use(express_1.default.static(path_1.default.join(process.cwd(), 'build')));
    app.get('*', (req, res) => {
        res.sendFile(path_1.default.join(process.cwd() + '/build/index.html'));
    });
}
app.listen(app.get("port"), () => {
    console.log(`🚀 Server ready at ${app.get("port")}`);
});
