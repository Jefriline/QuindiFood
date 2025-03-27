class UpdateUserDto {
    private _id: number;
    private _nombre: string;
    private _email: string;
    private _contraseña: string;
    private _descripcion: string;
    private _foto_perfil: string | Buffer;

    constructor(id: number, nombre: string, email: string, contraseña: string, descripcion: string, foto_perfil: string | Buffer) {
        this._id = id;
        this._nombre = nombre;
        this._email = email;
        this._contraseña = contraseña;
        this._descripcion = descripcion;
        this._foto_perfil = foto_perfil;
    }

    // Getters
    get id(): number {
        return this._id;
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

    get descripcion(): string {
        return this._descripcion;
    }

    get foto_perfil(): string | Buffer {
        return this._foto_perfil;
    }

    // Setters
    set id(id: number) {
        this._id = id;
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

    set descripcion(descripcion: string) {
        this._descripcion = descripcion;
    }

    set foto_perfil(foto_perfil: string | Buffer) {
        this._foto_perfil = foto_perfil;
    }
}

export default UpdateUserDto; 