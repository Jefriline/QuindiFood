class RegisterUser {
    private _nombre: string;
    private _email: string;
    private _contraseña: string;

    constructor(nombre: string, email: string, contraseña: string) {
        this._nombre = nombre;
        this._email = email;
        this._contraseña = contraseña;
    }

    // Getters
    get nombre(): string {
        return this._nombre;
    }

    get email(): string {
        return this._email;
    }

    get contraseña(): string {
        return this._contraseña;
    }

    // Setters
    set nombre(nombre: string) {
        this._nombre = nombre;
    }

    set email(email: string) {
        this._email = email;
    }

    set contraseña(contraseña: string) {
        this._contraseña = contraseña;
    }
}

export default RegisterUser;
