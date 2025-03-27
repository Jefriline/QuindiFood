import FavoritosRepository from '../../repositories/EstablecimientoRepository/favoritosRepository';
import { FavoritosDto } from '../../Dto/EstablecimientoDto/favoritosDto';

class FavoritosService {
    static async add(favorito: FavoritosDto) {
        try {
            await FavoritosRepository.add(favorito);
            return true;
        } catch (error) {
            console.error('Error en el servicio al agregar favorito:', error);
            throw error;
        }
    }
}

export default FavoritosService; 