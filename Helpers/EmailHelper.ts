export class EmailHelper {
    static sendConfirmationEmail(email: string, token: string): void {
        // Lógica para enviar email
        console.log(`Enviando email de confirmación a ${email} con token ${token}`);
    }

    static sendPasswordResetEmail(email: string, token: string): void {
        // Lógica para enviar email de recuperación de contraseña
        console.log(`Enviando email de recuperación de contraseña a ${email} con token ${token}`);
    }
}