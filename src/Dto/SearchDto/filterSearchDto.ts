class FilterSearchDto {
    private _tipoCocina?: string;
    private _precioMin?: number;
    private _precioMax?: number;
    private _valoracionMin?: number;
    private _disponibleAhora?: boolean;

    constructor(
        tipoCocina?: string,
        precioMin?: number,
        precioMax?: number,
        valoracionMin?: number,
        disponibleAhora?: boolean
    ) {
        this._tipoCocina = tipoCocina;
        this._precioMin = precioMin;
        this._precioMax = precioMax;
        this._valoracionMin = valoracionMin;
        this._disponibleAhora = disponibleAhora;
    }

    get tipoCocina() { return this._tipoCocina; }
    get precioMin() { return this._precioMin; }
    get precioMax() { return this._precioMax; }
    get valoracionMin() { return this._valoracionMin; }
    get disponibleAhora() { return this._disponibleAhora; }
}

export default FilterSearchDto; 