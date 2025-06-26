export class ListEstablecimientoDto {
    private _id_establecimiento: number;
    private _nombre: string;
    private _descripcion: string;
    private _ubicacion: string;
    private _categoria: string;
    private _imagen: { id_imagen: number, imagen: string }[];
    private _estado_membresia: string;
    private _estado_establecimiento: string;
    private _promedio: number;
    private _horarios: {
        dia: string;
        hora_apertura: string;
        hora_cierre: string;
    }[];
    private _fk_id_usuario: number;
    private _documentos?: any;
    private _created_at?: string;

    constructor(
        id_establecimiento: number,
        nombre: string,
        descripcion: string,
        ubicacion: string,
        categoria: string,
        imagen: { id_imagen: number, imagen: string }[],
        estado_membresia: string,
        promedio: number,
        horarios: { dia: string; hora_apertura: string; hora_cierre: string; }[],
        estado_establecimiento?: string,
        fk_id_usuario?: number,
        documentos?: any,
        created_at?: string
    ) {
        this._id_establecimiento = id_establecimiento;
        this._nombre = nombre;
        this._descripcion = descripcion;
        this._ubicacion = ubicacion;
        this._categoria = categoria;
        this._imagen = imagen;
        this._estado_membresia = estado_membresia;
        this._estado_establecimiento = estado_establecimiento || 'Pendiente';
        this._promedio = promedio;
        this._horarios = horarios;
        this._fk_id_usuario = fk_id_usuario || 0;
        this._documentos = documentos;
        this._created_at = created_at;
    }

    // Getters
    get id_establecimiento(): number { return this._id_establecimiento; }
    get nombre(): string { return this._nombre; }
    get descripcion(): string { return this._descripcion; }
    get ubicacion(): string { return this._ubicacion; }
    get categoria(): string { return this._categoria; }
    get imagen(): { id_imagen: number, imagen: string }[] { return this._imagen; }
    get estado_membresia(): string { return this._estado_membresia; }
    get estado_establecimiento(): string { return this._estado_establecimiento; }
    get promedio(): number { return this._promedio; }
    get horarios(): { dia: string; hora_apertura: string; hora_cierre: string; }[] { return this._horarios; }
    get fk_id_usuario(): number { return this._fk_id_usuario; }
    get documentos(): any { return this._documentos; }
    get created_at(): string | undefined { return this._created_at; }

    toJSON() {
        return {
            _id_establecimiento: this._id_establecimiento,
            _nombre: this._nombre,
            _descripcion: this._descripcion,
            _ubicacion: this._ubicacion,
            _categoria: this._categoria,
            _imagen: this._imagen,
            _estado_membresia: this._estado_membresia,
            _estado_establecimiento: this._estado_establecimiento,
            _promedio: this._promedio,
            _horarios: this._horarios,
            _fk_id_usuario: this._fk_id_usuario,
            _documentos: this._documentos,
            _created_at: this._created_at
        };
    }
}