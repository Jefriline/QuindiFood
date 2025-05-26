import FavoritoRepository from '../../repositories/FavoritoRepository/favoritoRepository';
import { FavoritoDto } from '../../Dto/FavoritoDto/favoritoDto';

class FavoritoService {
    static async addFavorito(id_usuario: number, id_establecimiento: number): Promise<{ success: boolean; message: string }> {
        try {
            const favorito = new FavoritoDto(id_usuario, id_establecimiento);
            const resultado = await FavoritoRepository.addFavorito(favorito);

            if (!resultado) {
                return {
                    success: false,
                    message: 'El establecimiento ya está en favoritos'
                };
            }

            return {
                success: true,
                message: 'Establecimiento agregado a favoritos exitosamente'
            };
        } catch (error: any) {
            console.error('Error en el servicio al agregar favorito:', error);
            throw new Error(error.message || 'Error al agregar favorito');
        }
    }

    static async removeFavorito(id_usuario: number, id_establecimiento: number): Promise<{ success: boolean; message: string }> {
        try {
            const favorito = new FavoritoDto(id_usuario, id_establecimiento);
            const resultado = await FavoritoRepository.removeFavorito(favorito);

            if (!resultado) {
                return {
                    success: false,
                    message: 'El establecimiento no está en favoritos'
                };
            }

            return {
                success: true,
                message: 'Establecimiento eliminado de favoritos exitosamente'
            };
        } catch (error: any) {
            console.error('Error en el servicio al eliminar favorito:', error);
            throw new Error(error.message || 'Error al eliminar favorito');
        }
    }

    static async listFavoritosByCliente(id_usuario: number) {
        try {
            const favoritos = await FavoritoRepository.listFavoritosByCliente(id_usuario);
            return {
                status: 'Éxito',
                favoritos
            };
        } catch (error: any) {
            console.error('Error en el servicio al listar favoritos:', error);
            throw new Error(error.message || 'Error al listar favoritos');
        }
    }

    static async getTotalFavoritosByEstablecimiento(id_establecimiento: number) {
        try {
            const total = await FavoritoRepository.getTotalFavoritosByEstablecimiento(id_establecimiento);
            return {
                status: 'Éxito',
                total_favoritos: total
            };
        } catch (error: any) {
            console.error('Error en el servicio al obtener total de favoritos:', error);
            throw new Error(error.message || 'Error al obtener total de favoritos');
        }
    }
}

export default FavoritoService; 