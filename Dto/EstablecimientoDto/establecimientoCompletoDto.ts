export class EstablecimientoCompletoDto {
    private _id_establecimiento: number;
    private _nombre: string;
    private _descripcion: string;
    private _ubicacion: string;
    private _categoria: string;
    private _imagen: string;
    private _estado_membresia: string;
    private _promedio: number;
    private _esta_abierto: boolean;
    private _horarios: {
        dia: string;
        hora_apertura: string;
        hora_cierre: string;
    }[];

    constructor(
        id_establecimiento: number,
        nombre: string,
        descripcion: string,
        ubicacion: string,
        categoria: string,
        imagen: string,
        estado_membresia: string,
        promedio: number,
        esta_abierto: boolean,
        horarios: {
            dia: string;
            hora_apertura: string;
            hora_cierre: string;
        }[]
    ) {
        this._id_establecimiento = id_establecimiento;
        this._nombre = nombre;
        this._descripcion = descripcion;
        this._ubicacion = ubicacion;
        this._categoria = categoria;
        this._imagen = imagen;
        this._estado_membresia = estado_membresia;
        this._promedio = promedio;
        this._esta_abierto = esta_abierto;
        this._horarios = horarios;
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

    get ubicacion(): string {
        return this._ubicacion;
    }

    get categoria(): string {
        return this._categoria;
    }

    get imagen(): string {
        return this._imagen;
    }

    get estado_membresia(): string {
        return this._estado_membresia;
    }

    get promedio(): number {
        return this._promedio;
    }

    get esta_abierto(): boolean {
        return this._esta_abierto;
    }

    get horarios(): {
        dia: string;
        hora_apertura: string;
        hora_cierre: string;
    }[] {
        return this._horarios;
    }
} 