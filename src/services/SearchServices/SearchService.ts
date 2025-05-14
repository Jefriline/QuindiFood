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
            .filter(e => {
                const nombreNorm = quitarTildes(e.nombre_establecimiento.toLowerCase());
                const descNorm = quitarTildes((e.descripcion || '').toLowerCase());
                return nombreNorm.includes(termino) || descNorm.includes(termino);
            })
            .map(e => new SugerenciaEstablecimientoDto(
                e.id_establecimiento,
                e.nombre_establecimiento,
                e.descripcion,
                e.imagenes,
                e.ubicacion,
                e.categoria,
                e.estado,
                Array.isArray(e.horarios) ? e.horarios : [],
                parseFloat(Number(e.promedio_calificacion).toFixed(2)),
                e.total_puntuaciones
            ))
            .sort((a, b) => (a.estado_membresia === 'Activo' ? -1 : 1));
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
        establecimientos = establecimientos.filter(e =>
            e.horarios.some((h: any) =>
                h.dia_semana === diaSemana &&
                h.hora_apertura <= horaActual &&
                h.hora_cierre > horaActual
            )
        );
    } else if (params.disponibleAhora === false) {
        establecimientos = establecimientos.filter(e =>
            !e.horarios.some((h: any) =>
                h.dia_semana === diaSemana &&
                h.hora_apertura <= horaActual &&
                h.hora_cierre > horaActual
            )
        );
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

    // Filtrado por tipo de producto (para productos)
    if (params.tipoProducto) {
        productos = productos.filter(p =>
            p.categoria?.toLowerCase() === params.tipoProducto!.toLowerCase()
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
        p.categoria  // Categoría del producto, que podría ser distinta de la del establecimiento
    ));

    // Retornar todos (o los primeros 10 si quieres limitar)
    return [...establecimientosMapeados, ...productosMapeados];
}


}

export default SearchService; 