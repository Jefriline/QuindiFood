class SugerenciaEstablecimientoDto {
    private _tipo: string = 'establecimiento';
    private _id: number;
    private _nombre: string;
    private _descripcion: string;
    private _imagen: string;
    private _ubicacion: string;
    private _categoria: string;
    private _estado_membresia: string;

    constructor(
        id: number,
        nombre: string,
        descripcion: string,
        imagen: string,
        ubicacion: string,
        categoria: string,
        estado_membresia: string
    ) {
        this._id = id;
        this._nombre = nombre;
        this._descripcion = descripcion;
        this._imagen = imagen;
        this._ubicacion = ubicacion;
        this._categoria = categoria;
        this._estado_membresia = estado_membresia;
    }

    get tipo() { return this._tipo; }
    get id() { return this._id; }
    get nombre() { return this._nombre; }
    get descripcion() { return this._descripcion; }
    get imagen() { return this._imagen; }
    get ubicacion() { return this._ubicacion; }
    get categoria() { return this._categoria; }
    get estado_membresia() { return this._estado_membresia; }
}

class SugerenciaProductoDto {
    private _tipo: string = 'producto';
    private _id: number;
    private _nombre: string;
    private _precio: number;
    private _id_establecimiento: number;
    private _nombre_establecimiento: string;
    private _imagen: string;
    private _estado_membresia_establecimiento: string;

    constructor(
        id: number,
        nombre: string,
        precio: number,
        id_establecimiento: number,
        nombre_establecimiento: string,
        imagen: string,
        estado_membresia_establecimiento: string
    ) {
        this._id = id;
        this._nombre = nombre;
        this._precio = precio;
        this._id_establecimiento = id_establecimiento;
        this._nombre_establecimiento = nombre_establecimiento;
        this._imagen = imagen;
        this._estado_membresia_establecimiento = estado_membresia_establecimiento;
    }

    get tipo() { return this._tipo; }
    get id() { return this._id; }
    get nombre() { return this._nombre; }
    get precio() { return this._precio; }
    get id_establecimiento() { return this._id_establecimiento; }
    get nombre_establecimiento() { return this._nombre_establecimiento; }
    get imagen() { return this._imagen; }
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