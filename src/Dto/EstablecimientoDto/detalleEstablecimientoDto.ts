export class DetalleEstablecimientoDto {
    private _id_establecimiento: number;
    private _nombre: string;
    private _ubicacion: string;
    private _telefono: string;
    private _descripcion: string;
    private _multimedia: string[];
    private _contactos: string[];

    constructor(
        id_establecimiento: number,
        nombre: string,
        ubicacion: string,
        telefono: string,
        descripcion: string,
        multimedia: string[],
        contactos: string[]
    ) {
        this._id_establecimiento = id_establecimiento;
        this._nombre = nombre;
        this._ubicacion = ubicacion;
        this._telefono = telefono;
        this._descripcion = descripcion;
        this._multimedia = multimedia;
        this._contactos = contactos;
    }

    get id_establecimiento(): number {
        return this._id_establecimiento;
    }

    get nombre(): string {
        return this._nombre;
    }

    get ubicacion(): string {
        return this._ubicacion;
    }

    get telefono(): string {
        return this._telefono;
    }

    get descripcion(): string {
        return this._descripcion;
    }

    get multimedia(): string[] {
        return this._multimedia;
    }

    get contactos(): string[] {
        return this._contactos;
    }
} 