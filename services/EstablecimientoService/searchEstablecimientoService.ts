import EstablecimientoRepository from '../../repositories/EstablecimientoRepository/establecimientoRepository';
import SearchEstablecimientoDto from '../../Dto/EstablecimientoDto/searchEstablecimientoDto';

class SearchEstablecimientoService {
    static async searchByName(searchDto: SearchEstablecimientoDto) {
        try {
            const establecimientos = await EstablecimientoRepository.searchByName(searchDto.nombre);
            return {
                success: true,
                data: establecimientos,
                message: establecimientos.length > 0 ? 'Establecimientos encontrados' : 'No se encontraron establecimientos'
            };
        } catch (error) {
            console.error('Error en searchByName service:', error);
            throw error;
        }
    }
}

export default SearchEstablecimientoService; 