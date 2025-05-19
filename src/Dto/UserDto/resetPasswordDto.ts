export default class ResetPasswordDto {
    email: string;
    contraseña: string;
    confirmarContraseña: string;

    constructor(email: string, contraseña: string, confirmarContraseña: string) {
        this.email = email;
        this.contraseña = contraseña;
        this.confirmarContraseña = confirmarContraseña;
    }
} 