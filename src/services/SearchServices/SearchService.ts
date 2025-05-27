import SearchRepository from '../../repositories/SearchRepository/searchRepository';
import { quitarTildes } from '../../Helpers/Normalize/quitarTildes';
import { SugerenciaEstablecimientoDto, SugerenciaProductoDto } from '../../Dto/SearchDto/searchByTermsDto';
import { FilterParamsDto } from '../../interfaces/search/filterParams.interface';

class SearchService {
    static async searchByTerms(q: string): Promise<(SugerenciaEstablecimientoDto | SugerenciaProductoDto)[]> {
        const termino = quitarTildes(q.toLowerCase().trim());
        const { establecimientos, productos } = await SearchRepository.getEstablecimientosYProductosActivos();
        
        // Eliminar duplicados de establecimientos y productos por _id
        const establecimientosUnicos = [];
        const idsEstablecimientos = new Set();
        for (const e of establecimientos) {
            if (!idsEstablecimientos.has(e.id_establecimiento)) {
                idsEstablecimientos.add(e.id_establecimiento);
                establecimientosUnicos.push(e);
            }
        }
        const productosUnicos = [];
        const idsProductos = new Set();
        for (const p of productos) {
            if (!idsProductos.has(p.id_producto)) {
                idsProductos.add(p.id_producto);
                productosUnicos.push(p);
            }
        }
        // Mapear establecimientos con horarios
        const establecimientosFiltrados = establecimientosUnicos
            .map(e => {
                const nombreNorm = quitarTildes(e.nombre_establecimiento.toLowerCase());
                const descNorm = quitarTildes((e.descripcion || '').toLowerCase());
                let relevancia = 0;
                if (nombreNorm === termino) relevancia = 3; // Coincidencia exacta
                else if (nombreNorm.startsWith(termino)) relevancia = 2; // Al inicio
                else if (nombreNorm.includes(termino)) relevancia = 1; // En el nombre
                else if (descNorm.includes(termino)) relevancia = 0.5; // En la descripción
                return { e, relevancia };
            })
            .filter(obj => obj.relevancia > 0)
            .sort((a, b) => b.relevancia - a.relevancia)
            .map(obj => new SugerenciaEstablecimientoDto(
                obj.e.id_establecimiento,
                obj.e.nombre_establecimiento,
                obj.e.descripcion,
                obj.e.imagenes,
                obj.e.ubicacion,
                obj.e.categoria,
                obj.e.estado,
                Array.isArray(obj.e.horarios) ? obj.e.horarios : [],
                parseFloat(Number(obj.e.promedio_calificacion).toFixed(2)),
                obj.e.total_puntuaciones
            ));
        // Mapear productos con descripción
        const productosFiltrados = productosUnicos
            .filter(p => {
                const nombreNorm = quitarTildes(p.nombre.toLowerCase());
                const descNorm = quitarTildes((p.descripcion || '').toLowerCase());
                return nombreNorm.includes(termino) || descNorm.includes(termino);
            })
            .map(p => new SugerenciaProductoDto(
                p.id_producto,
                p.nombre,
                p.precio,
                p.descripcion,
                p.fk_id_establecimiento,
                p.nombre_establecimiento,
                p.imagenes,
                p.estado
            ));
        // Unir ambos arrays y devolver como sugerencias
        return [...establecimientosFiltrados, ...productosFiltrados].slice(0, 10);
    }

    static async getCategories() {
        return await SearchRepository.getCategories();
    }

    static async filterByParams(params: FilterParamsDto) {
    const sugerencias = await this.SearchToFilter();

    let establecimientos = sugerencias.filter(s => s instanceof SugerenciaEstablecimientoDto);
    let productos = sugerencias.filter(s => s instanceof SugerenciaProductoDto);

    const dias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const now = new Date();
    const diaSemana = dias[now.getDay()];
    const horaActual = now.toTimeString().slice(0, 5);

    let totalEstablecimientosAntesDisponibilidad = establecimientos.length;

    // Filtrado por disponibilidad
    if (params.disponibleAhora === true) {
        console.log('Filtrando por disponibilidad:', {
            diaSemana,
            horaActual
        });

        establecimientos = establecimientos.filter(e => {
            if (!e.horarios || e.horarios.length === 0) {
                return false; // Si no tiene horarios, no está disponible
            }

            return e.horarios.some((h: any) => {
                const coincideDia = h.dia_semana === diaSemana;
                const estaEnHorario = h.hora_apertura <= horaActual && h.hora_cierre > horaActual;
                
                console.log('Verificando horario:', {
                    establecimiento: e.nombre,
                    dia: h.dia_semana,
                    apertura: h.hora_apertura,
                    cierre: h.hora_cierre,
                    coincideDia,
                    estaEnHorario
                });

                return coincideDia && estaEnHorario;
            });
        });

        console.log('Establecimientos disponibles:', establecimientos.length);
    }

    // Filtrado por precio
    if (params.precioMin !== undefined) {
        productos = productos.filter(p => p.precio >= params.precioMin!);
    }
    if (params.precioMax !== undefined) {
        productos = productos.filter(p => p.precio <= params.precioMax!);
    }

    // Filtrado por tipo de cocina (para establecimientos)
    if (params.tipoCocina) {
        establecimientos = establecimientos.filter(e =>
            e.categoria?.toLowerCase() === params.tipoCocina!.toLowerCase()
        );
    }


    // Filtrado por calificación, si ambos valores existen
    if (params.calificacionMin !== undefined && params.calificacionMax !== undefined) {
        establecimientos = establecimientos.filter(e =>
            e.promedio_calificacion >= (params.calificacionMin ?? 0) && e.promedio_calificacion <= (params.calificacionMax ?? 5)
        );
    }

    const resultado = {
        establecimientos,
        productos,
        sinEstablecimientosPorDisponibilidad: params.disponibleAhora === true && totalEstablecimientosAntesDisponibilidad > 0 && establecimientos.length === 0
    };

    return resultado;
}

static async SearchToFilter(): Promise<(SugerenciaEstablecimientoDto | SugerenciaProductoDto)[]> {
    const { establecimientos, productos } = await SearchRepository.getEstablecimientosYProductosActivosForFilter();

    // Eliminar duplicados de establecimientos y productos por ID
    const establecimientosUnicos = [];
    const idsEstablecimientos = new Set();
    for (const e of establecimientos) {
        if (!idsEstablecimientos.has(e.id_establecimiento)) {
            idsEstablecimientos.add(e.id_establecimiento);
            establecimientosUnicos.push(e);
        }
    }

    const productosUnicos = [];
    const idsProductos = new Set();
    for (const p of productos) {
        if (!idsProductos.has(p.id_producto)) {
            idsProductos.add(p.id_producto);
            productosUnicos.push(p);
        }
    }

    // Mapear establecimientos a DTO
    const establecimientosMapeados = establecimientosUnicos.map(e => new SugerenciaEstablecimientoDto(
        e.id_establecimiento,
        e.nombre_establecimiento,
        e.descripcion,
        e.imagenes,
        e.ubicacion,
        e.categoria,  // Categoria de cocina para el establecimiento
        e.estado ?? null,
        Array.isArray(e.horarios) ? e.horarios : [],
        parseFloat(Number(e.promedio_calificacion).toFixed(2)),
        e.total_puntuaciones
    ));

    // Mapear productos a DTO, incluyendo la categoría de su establecimiento
    const productosMapeados = productosUnicos.map(p => new SugerenciaProductoDto(
        p.id_producto,
        p.nombre,
        p.precio,
        p.descripcion,
        p.FK_id_establecimiento,  // Relación con el establecimiento
        p.nombre_establecimiento,
        p.imagenes,
        p.estado ?? null,
    ));

    // Retornar todos (o los primeros 10 si quieres limitar)
    return [...establecimientosMapeados, ...productosMapeados];
}


}

export default SearchService; 