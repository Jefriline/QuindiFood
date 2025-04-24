class ToggleUserStatusDto {
    private _id_usuario: number;
    private _estado: string;

    constructor(id_usuario: number, estado: string) {
        this._id_usuario = id_usuario;
        this._estado = estado;
    }

    get id_usuario(): number {
        return this._id_usuario;
    }

    get estado(): string {
        return this._estado;
    }

    set id_usuario(id_usuario: number) {
        this._id_usuario = id_usuario;
    }

    set estado(estado: string) {
        if (estado !== 'Activo' && estado !== 'Inactivo') {
            throw new Error('El estado debe ser "Activo" o "Inactivo"');
        }
        this._estado = estado;
    }
}

export default ToggleUserStatusDto; 