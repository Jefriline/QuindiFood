export class ListEstablecimientoDto {
    private _id_establecimiento: number;
    private _nombre: string;
    private _descripcion: string;
    private _ubicacion: string;
    private _categoria: string;
    private _imagen: { id_imagen: number, imagen: string }[];
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
        imagen: { id_imagen: number, imagen: string }[],
        estado_membresia: string,
        promedio: number,
        esta_abierto: boolean,
        horarios: { dia: string; hora_apertura: string; hora_cierre: string; }[]
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

    // Getters
    get id_establecimiento(): number { return this._id_establecimiento; }
    get nombre(): string { return this._nombre; }
    get descripcion(): string { return this._descripcion; }
    get ubicacion(): string { return this._ubicacion; }
    get categoria(): string { return this._categoria; }
    get imagen(): { id_imagen: number, imagen: string }[] { return this._imagen; }
    get estado_membresia(): string { return this._estado_membresia; }
    get promedio(): number { return this._promedio; }
    get esta_abierto(): boolean { return this._esta_abierto; }
    get horarios(): { dia: string; hora_apertura: string; hora_cierre: string; }[] { return this._horarios; }

    toJSON() {
        return {
            _id_establecimiento: this._id_establecimiento,
            _nombre: this._nombre,
            _descripcion: this._descripcion,
            _ubicacion: this._ubicacion,
            _categoria: this._categoria,
            _imagen: this._imagen,
            _estado_membresia: this._estado_membresia,
            _promedio: this._promedio,
            _esta_abierto: this._esta_abierto,
            _horarios: this._horarios
        };
    }
}