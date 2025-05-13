class RegisterAdmin {
    private _nombre: string;
    private _email: string;
    private _contraseña: string;
    private _codigoAdmin: string;

    constructor(nombre: string, email: string, contraseña: string, codigoAdmin: string) {
        this._nombre = nombre;
        this._email = email;
        this._contraseña = contraseña;
        this._codigoAdmin = codigoAdmin;
    }

    get nombre(): string {
        return this._nombre;
    }

    get email(): string {
        return this._email;
    }

    get contraseña(): string {
        return this._contraseña;
    }

    get codigoAdmin(): string {
        return this._codigoAdmin;
    }

    set nombre(nombre: string) {
        this._nombre = nombre;
    }

    set email(email: string) {
        this._email = email;
    }

    set contraseña(contraseña: string) {
        this._contraseña = contraseña;
    }

    set codigoAdmin(codigoAdmin: string) {
        this._codigoAdmin = codigoAdmin;
    }
}

export default RegisterAdmin; 