export class FavoritoDto {
    private _id_usuario: number;
    private _id_establecimiento: number;

    constructor(id_usuario: number, id_establecimiento: number) {
        this._id_usuario = id_usuario;
        this._id_establecimiento = id_establecimiento;
    }

    get id_usuario() { return this._id_usuario; }
    get id_establecimiento() { return this._id_establecimiento; }
} 