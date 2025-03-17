"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailHelper = void 0;
class EmailHelper {
    static sendConfirmationEmail(email, token) {
        // Lógica para enviar email
        console.log(`Enviando email de confirmación a ${email} con token ${token}`);
    }
    static sendPasswordResetEmail(email, token) {
        // Lógica para enviar email de recuperación de contraseña
        console.log(`Enviando email de recuperación de contraseña a ${email} con token ${token}`);
    }
}
exports.EmailHelper = EmailHelper;
