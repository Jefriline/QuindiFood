export class FavoritosDto {
    private _fk_id_cliente: number;
    private _fk_id_establecimiento: number;

    constructor(fk_id_cliente: number, fk_id_establecimiento: number) {
        this._fk_id_cliente = fk_id_cliente;
        this._fk_id_establecimiento = fk_id_establecimiento;
    }

    get fk_id_cliente(): number {
        return this._fk_id_cliente;
    }

    get fk_id_establecimiento(): number {
        return this._fk_id_establecimiento;
    }

    set fk_id_cliente(fk_id_cliente: number) {
        this._fk_id_cliente = fk_id_cliente;
    }

    set fk_id_establecimiento(fk_id_establecimiento: number) {
        this._fk_id_establecimiento = fk_id_establecimiento;
    }
} 