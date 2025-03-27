export class ListEstablecimientoDto {
    private _id_establecimiento: number;
    private _nombre: string;
    private _descripcion: string;
    private _multimedia: string[];

    constructor(
        id_establecimiento: number,
        nombre: string,
        descripcion: string,
        multimedia: string[]
    ) {
        this._id_establecimiento = id_establecimiento;
        this._nombre = nombre;
        this._descripcion = descripcion;
        this._multimedia = multimedia;
    }

    get id_establecimiento(): number {
        return this._id_establecimiento;
    }

    get nombre(): string {
        return this._nombre;
    }

    get descripcion(): string {
        return this._descripcion;
    }

    get multimedia(): string[] {
        return this._multimedia;
    }
} 