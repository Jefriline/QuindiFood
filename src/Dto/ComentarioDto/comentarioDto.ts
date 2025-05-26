export class ComentarioDto {
    private _id_cliente: number;
    private _id_establecimiento: number;
    private _cuerpo_comentario: string;
    private _id_comentario_padre?: number;

    constructor(id_cliente: number, id_establecimiento: number, cuerpo_comentario: string, id_comentario_padre?: number) {
        this._id_cliente = id_cliente;
        this._id_establecimiento = id_establecimiento;
        this._cuerpo_comentario = cuerpo_comentario;
        this._id_comentario_padre = id_comentario_padre;
    }

    get id_cliente() { return this._id_cliente; }
    get id_establecimiento() { return this._id_establecimiento; }
    get cuerpo_comentario() { return this._cuerpo_comentario; }
    get id_comentario_padre() { return this._id_comentario_padre; }
} 