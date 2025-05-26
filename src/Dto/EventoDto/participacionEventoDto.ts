export default class ParticipacionEventoDto {
    id_evento: number;
    id_establecimiento: number;
    titulo: string;
    precio: number;
    descripcion?: string;
    imagen_participacion?: string;

    constructor(
        id_evento: number,
        id_establecimiento: number,
        titulo: string,
        precio: number,
        descripcion?: string,
        imagen_participacion?: string
    ) {
        this.id_evento = id_evento;
        this.id_establecimiento = id_establecimiento;
        this.titulo = titulo;
        this.precio = precio;
        this.descripcion = descripcion;
        this.imagen_participacion = imagen_participacion;
    }
} 