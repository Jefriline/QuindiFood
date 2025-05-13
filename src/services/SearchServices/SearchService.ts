import SearchRepository from '../../repositories/SearchRepository/searchRepository';
import { quitarTildes } from '../../Helpers/Normalize/quitarTildes';
import { SugerenciaEstablecimientoDto, SugerenciaProductoDto } from '../../Dto/SearchDto/searchByTermsDto';
import FilterSearchDto from '../../Dto/SearchDto/filterSearchDto';

class SearchService {
    static async searchByTerms(q: string): Promise<(SugerenciaEstablecimientoDto | SugerenciaProductoDto)[]> {
        const termino = quitarTildes(q.toLowerCase().trim());
        const { establecimientos, productos } = await SearchRepository.getEstablecimientosYProductosActivos();
        
        // Filtrar establecimientos
        const sugerenciasEstablecimientos = establecimientos
            .filter(e => {
                const nombreNorm = quitarTildes(e.nombre_establecimiento.toLowerCase());
                const descNorm = quitarTildes((e.descripcion || '').toLowerCase());
                return nombreNorm.includes(termino) || descNorm.includes(termino);
            })
            .map(e => new SugerenciaEstablecimientoDto(
                e.id_establecimiento,
                e.nombre_establecimiento,
                e.descripcion,
                e.imagen,
                e.ubicacion,
                e.categoria,
                e.estado
            ));

        // Filtrar productos
        const sugerenciasProductos = productos
            .filter(p =>
                quitarTildes(p.nombre.toLowerCase()).includes(termino) ||
                quitarTildes((p.descripcion || '').toLowerCase()).includes(termino)
            )
            .map(p => new SugerenciaProductoDto(
                p.id_producto,
                p.nombre,
                p.precio,
                p.fk_id_establecimiento,
                p.nombre_establecimiento,
                p.imagen,
                p.estado
            ));

        // Priorizar establecimientos, luego productos
        return [...sugerenciasEstablecimientos, ...sugerenciasProductos].slice(0, 10);
    }

    static async getCategories() {
        return await SearchRepository.getCategories();
    }

    static async filterSearch(query: any) {
        // Instanciar el DTO con los datos del query
        const filtrosDto = new FilterSearchDto(
            query.tipoCocina,
            query.precioMin ? Number(query.precioMin) : undefined,
            query.precioMax ? Number(query.precioMax) : undefined,
            query.valoracionMin ? Number(query.valoracionMin) : undefined,
            query.disponibleAhora === 'true'
        );
        const termino = quitarTildes((query.q || '').toLowerCase().trim());
        try {
            // Traer todos los datos posibles según los filtros SQL básicos
            const { establecimientos, productos } = await SearchRepository.filterSearch(filtrosDto);
            // Filtrar por término de búsqueda en ambos arrays
            const establecimientosFiltrados = establecimientos
                .filter(e => {
                    const nombreNorm = quitarTildes(e.nombre_establecimiento.toLowerCase());
                    const descNorm = quitarTildes((e.descripcion || '').toLowerCase());
                    return nombreNorm.includes(termino) || descNorm.includes(termino);
                })
                .sort((a, b) => (a.estado === 'Activo' ? -1 : 1)); // Ordenar por membresía
            const productosFiltrados = productos
                .filter(p => {
                    const nombreNorm = quitarTildes(p.nombre.toLowerCase());
                    const descNorm = quitarTildes((p.descripcion || '').toLowerCase());
                    return nombreNorm.includes(termino) || descNorm.includes(termino);
                });
            return {
                establecimientos: establecimientosFiltrados,
                productos: productosFiltrados
            };
        } catch (error) {
            console.error(error);
            if (error instanceof Error) {
                throw new Error(error.message);
            }
            throw new Error('Error al filtrar los resultados de búsqueda');
        }
    }
}

export default SearchService; 