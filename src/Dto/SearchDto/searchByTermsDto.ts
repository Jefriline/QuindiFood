class SugerenciaEstablecimientoDto {
    private _tipo: string = 'establecimiento';
    private _id: number;
    private _nombre: string;
    private _descripcion: string;
    private _imagenes: Array<{id_imagen: number, imagen: string}>;
    private _ubicacion: string;
    private _categoria: string;
    private _estado_membresia: string;
    private _horarios: Array<{dia_semana: string, hora_apertura: string, hora_cierre: string}>;
    private _promedio_calificacion: number;
    private _total_puntuaciones: number;

    constructor(
        id: number,
        nombre: string,
        descripcion: string,
        imagenes: Array<{id_imagen: number, imagen: string}>,
        ubicacion: string,
        categoria: string,
        estado_membresia: string,
        horarios?: Array<{dia_semana: string, hora_apertura: string, hora_cierre: string}>,
        promedio_calificacion?: number,
        total_puntuaciones?: number
    ) {
        this._id = id;
        this._nombre = nombre;
        this._descripcion = descripcion;
        this._imagenes = imagenes || [];
        this._ubicacion = ubicacion;
        this._categoria = categoria;
        this._estado_membresia = estado_membresia;
        this._horarios = horarios || [];
        this._promedio_calificacion = promedio_calificacion ?? 0;
        this._total_puntuaciones = total_puntuaciones ?? 0;
    }

    get tipo() { return this._tipo; }
    get id() { return this._id; }
    get nombre() { return this._nombre; }
    get descripcion() { return this._descripcion; }
    get imagenes() { return this._imagenes; }
    get ubicacion() { return this._ubicacion; }
    get categoria() { return this._categoria; }
    get estado_membresia() { return this._estado_membresia; }
    get horarios() { return this._horarios; }
    get promedio_calificacion() { return this._promedio_calificacion; }
    get total_puntuaciones() { return this._total_puntuaciones; }
}

class SugerenciaProductoDto {
    private _tipo: string = 'producto';
    private _id: number;
    private _nombre: string;
    private _precio: number;
    private _descripcion: string;
    private _id_establecimiento: number;
    private _nombre_establecimiento: string;
    private _imagenes: Array<{id_imagen: number, imagen: string}>;
    private _estado_membresia_establecimiento: string;

    constructor(
        id: number,
        nombre: string,
        precio: number,
        descripcion: string,
        id_establecimiento: number,
        nombre_establecimiento: string,
        imagenes: Array<{id_imagen: number, imagen: string}>,
        estado_membresia_establecimiento: string,

    ) {
        this._id = id;
        this._nombre = nombre;
        this._precio = precio;
        this._descripcion = descripcion;
        this._id_establecimiento = id_establecimiento;
        this._nombre_establecimiento = nombre_establecimiento;
        this._imagenes = imagenes || [];
        this._estado_membresia_establecimiento = estado_membresia_establecimiento;
    }

    get tipo() { return this._tipo; }
    get id() { return this._id; }
    get nombre() { return this._nombre; }
    get precio() { return this._precio; }
    get descripcion() { return this._descripcion; }
    get id_establecimiento() { return this._id_establecimiento; }
    get nombre_establecimiento() { return this._nombre_establecimiento; }
    get imagenes() { return this._imagenes; }
    get estado_membresia_establecimiento() { return this._estado_membresia_establecimiento; }

}

class SearchByTermsResponseDto {
    private _sugerencias: (SugerenciaEstablecimientoDto | SugerenciaProductoDto)[];

    constructor(sugerencias: (SugerenciaEstablecimientoDto | SugerenciaProductoDto)[]) {
        this._sugerencias = sugerencias;
    }

    get sugerencias(): (SugerenciaEstablecimientoDto | SugerenciaProductoDto)[] {
        return this._sugerencias;
    }
}

export { SugerenciaEstablecimientoDto, SugerenciaProductoDto, SearchByTermsResponseDto }; 