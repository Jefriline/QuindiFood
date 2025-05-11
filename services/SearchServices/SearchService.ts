import SearchRepository from '../../repositories/SearchRepository/searchRepository';
import { quitarTildes } from '../../Helpers/Normalize/quitarTildes';
import { SugerenciaEstablecimientoDto, SugerenciaProductoDto } from '../../Dto/SearchDto/searchByTermsDto';

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
}

export default SearchService; 