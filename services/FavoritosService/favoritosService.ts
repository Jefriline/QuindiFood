import FavoritosRepository from '../../repositories/FavoritosRepository/favoritosRepository';
import { FavoritosDto } from '../../Dto/FavoritosDto/favoritosDto';

class FavoritosService {
    static async add(favorito: FavoritosDto) {
        try {
            // Verificar si ya existe el favorito
            const exists = await FavoritosRepository.exists(
                favorito.fk_id_cliente,
                favorito.fk_id_establecimiento
            );

            if (exists) {
                throw new Error('El establecimiento ya está en favoritos');
            }

            // Agregar el favorito
            return await FavoritosRepository.add(favorito);
        } catch (error) {
            console.error('Error en el servicio al agregar favorito:', error);
            throw error;
        }
    }
}

export default FavoritosService; 