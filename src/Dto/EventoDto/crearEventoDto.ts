export default class CrearEventoDto {
    nombre: string;
    descripcion: string;
    fecha_inicio: string;
    fecha_fin: string;
    imagen_evento?: string;

    constructor(
        nombre: string,
        descripcion: string,
        fecha_inicio: string,
        fecha_fin: string,
        imagen_evento?: string,
        
    ) {
        this.nombre = nombre;
        this.descripcion = descripcion;
        this.fecha_inicio = fecha_inicio;
        this.fecha_fin = fecha_fin;
        this.imagen_evento = imagen_evento;
        
    }
} 