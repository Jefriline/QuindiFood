"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const body_parser_1 = __importDefault(require("body-parser"));
const userRoutes_1 = __importDefault(require("./routes/UserRoutes/userRoutes"));
dotenv_1.default.config();
const app = (0, express_1.default)().use(body_parser_1.default.json());
app.get('/', (req, res) => {
    res.send('¡QuindiFood está funcionando! ');
});
// routes
app.use('/user', userRoutes_1.default);
const PORT = process.env.PORT || 10101;
app.listen(PORT, () => {
    console.log("Servidor ejecutándose en el puerto: ", PORT);
}).on("error", (error) => {
    throw new Error(error.message);
});
