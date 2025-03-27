import db from '../../config/config-db';
import { FavoritosDto } from '../../Dto/FavoritosDto/favoritosDto';

class FavoritosRepository {
    static async add(favorito: FavoritosDto) {
        try {
            const sql = `
                INSERT INTO favoritos (fk_id_cliente, fk_id_establecimiento)
                VALUES ($1, $2)
                RETURNING *
            `;
            
            const values = [
                favorito.fk_id_cliente,
                favorito.fk_id_establecimiento
            ];

            const result = await db.query(sql, values);
            return result.rows[0];
        } catch (error) {
            console.error('Error al agregar favorito:', error);
            throw error;
        }
    }

    static async exists(fk_id_cliente: number, fk_id_establecimiento: number): Promise<boolean> {
        try {
            const sql = `
                SELECT COUNT(*) as count
                FROM favoritos
                WHERE fk_id_cliente = $1 AND fk_id_establecimiento = $2
            `;
            
            const result = await db.query(sql, [fk_id_cliente, fk_id_establecimiento]);
            return result.rows[0].count > 0;
        } catch (error) {
            console.error('Error al verificar favorito:', error);
            throw error;
        }
    }
}

export default FavoritosRepository; 