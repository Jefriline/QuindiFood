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
        const sugerencias = await this.searchByTerms(params.q);

        let establecimientos = sugerencias.filter(s => s instanceof SugerenciaEstablecimientoDto);
        let productos = sugerencias.filter(s => s instanceof SugerenciaProductoDto);

        if (params.disponibleAhora) {
            const dias = ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'];
            const now = new Date();
            const diaSemana = dias[now.getDay()];
            const horaActual = now.toTimeString().slice(0,5);
            establecimientos = establecimientos.filter(e =>
                e.horarios.some((h: any) =>
                    h.dia_semana === diaSemana &&
                    h.hora_apertura <= horaActual &&
                    h.hora_cierre > horaActual
                )
            );
        }

        if (params.precioMin !== undefined) {
            productos = productos.filter(p => p.precio >= params.precioMin!);
        }
        if (params.precioMax !== undefined) {
            productos = productos.filter(p => p.precio <= params.precioMax!);
        }

        if (params.tipoCocina) {
            establecimientos = establecimientos.filter(e =>
                e.categoria?.toLowerCase() === params.tipoCocina!.toLowerCase()
            );
        }

        return [...establecimientos, ...productos];
    }
}

export default SearchService; 