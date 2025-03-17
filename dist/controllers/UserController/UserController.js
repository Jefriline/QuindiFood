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
exports.UserController = void 0;
const UserService_1 = require("../UserService");
const EmailHelper_1 = require("../Helpers/EmailHelper");
class UserController {
    constructor() {
        this.userService = new UserService_1.UserService();
    }
    login(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { email, password } = req.body;
            const user = yield this.userService.authenticate(email, password);
            if (user) {
                res.json({ message: 'Login exitoso', user });
            }
            else {
                res.status(401).json({ message: 'Credenciales inválidas' });
            }
        });
    }
    register(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield this.userService.createUser(req.body);
            EmailHelper_1.EmailHelper.sendConfirmationEmail(user.email, 'confirmation_token');
            res.json({ message: 'Usuario registrado', user });
        });
    }
    recoverPassword(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { email } = req.body;
            const token = yield this.userService.generatePasswordResetToken(email);
            EmailHelper_1.EmailHelper.sendPasswordResetEmail(email, token);
            res.json({ message: 'Email de recuperación enviado' });
        });
    }
    showProfile(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield this.userService.getUserById(req.params.id);
            res.json(user);
        });
    }
    updateProfile(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const updatedUser = yield this.userService.updateUser(req.params.id, req.body);
            res.json(updatedUser);
        });
    }
    logout(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            // Lógica para cerrar sesión
            res.json({ message: 'Sesión cerrada' });
        });
    }
    contactSupport(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            // Lógica para contactar al servicio técnico
            res.json({ message: 'Mensaje enviado al servicio técnico' });
        });
    }
    changeRole(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const updatedUser = yield this.userService.changeUserRole(req.params.id, req.body.role);
            res.json(updatedUser);
        });
    }
}
exports.UserController = UserController;
