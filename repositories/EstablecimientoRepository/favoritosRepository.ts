import db from '../../config/config-db';
import { FavoritosDto } from '../../Dto/EstablecimientoDto/favoritosDto';

class FavoritosRepository {
    static async add(favorito: FavoritosDto) {
        const sql = 'INSERT INTO favoritos (fk_id_cliente, fk_id_establecimiento) VALUES ($1, $2)';
        const values = [favorito.id_cliente, favorito.id_establecimiento];
        return await db.query(sql, values);
    }
}

export default FavoritosRepository; 