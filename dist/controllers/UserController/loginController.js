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
exports.loginController = void 0;
const emailService_1 = require("./emailService");
const usersDB = [];
exports.loginController = {
    login: (req, res) => {
        const { email, password } = req.body;
        const user = usersDB.find((u) => u.email === email && u.password === password);
        if (!user) {
            return res.status(401).json({ message: "Credenciales incorrectas" });
        }
        res.json({ message: "Inicio de sesión exitoso" });
    },
    recoverPassword: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { email } = req.body;
        const user = usersDB.find((u) => u.email === email);
        if (!user) {
            return res.status(404).json({ message: "Correo no registrado" });
        }
        // Simulamos un enlace de recuperación
        const recoveryLink = `https://quindifood.com/recover-password?email=${email}`;
        const result = yield (0, emailService_1.sendEmail)(email, "Recuperación de contraseña - QuindiFood", `Hemos recibido una solicitud para restablecer tu contraseña. Usa el siguiente enlace para restablecerla: ${recoveryLink}`);
        if (result.success) {
            res.json({ message: result.message });
        }
        else {
            res.status(500).json({ message: result.message });
        }
    }),
    sendConfirmationEmail: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { email } = req.body;
        const result = yield (0, emailService_1.sendEmail)(email, "Confirmación de Registro - QuindiFood", "Gracias por registrarte en QuindiFood. Por favor, verifica tu correo electrónico.");
        if (result.success) {
            res.json({ message: result.message });
        }
        else {
            res.status(500).json({ message: result.message });
        }
    }),
};
