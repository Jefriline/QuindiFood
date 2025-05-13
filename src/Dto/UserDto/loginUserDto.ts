class LoginUser {
    private _email: string;
    private _contraseña: string;

    constructor(email: string, contraseña: string) {
        this._email = email;
        this._contraseña = contraseña;
    }

    // Getters
    get email(): string {
        return this._email;
    }

    get contraseña(): string {
        return this._contraseña;
    }

    // Setters
    set email(email: string) {
        this._email = email;
    }

    set contraseña(contraseña: string) {
        this._contraseña = contraseña;
    }
}

export default LoginUser;