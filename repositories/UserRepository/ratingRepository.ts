import db from "../../config/config-db";
import RatingDto from "../../Dto/UserDto/ratingDto";

class RatingRepository {
    static async addRating(rating: RatingDto) {
        try {
            // Verificar si el cliente existe
            const clienteCheck = await db.query(
                "SELECT * FROM usuario_general WHERE id_usuario = $1",
                [rating.id_cliente]
            );

            if (clienteCheck.rows.length === 0) {
                throw new Error('El cliente no existe');
            }

            // Verificar si el establecimiento existe
            const establecimientoCheck = await db.query(
                "SELECT * FROM establecimiento WHERE id_establecimiento = $1",
                [rating.id_establecimiento]
            );

            if (establecimientoCheck.rows.length === 0) {
                throw new Error('El establecimiento no existe');
            }

            // Verificar si ya existe una puntuación
            const existingRating = await this.getRating(rating.id_cliente, rating.id_establecimiento);
            if (existingRating !== null) {
                throw new Error('Ya existe una puntuación para este establecimiento');
            }

            const sql = `
                INSERT INTO visualiza (fk_id_cliente, fk_id_establecimiento, puntuacion)
                VALUES ($1, $2, $3)
                RETURNING puntuacion
            `;
            
            const result = await db.query(sql, [
                rating.id_cliente,
                rating.id_establecimiento,
                rating.puntuacion
            ]);

            return result.rows[0].puntuacion;
        } catch (error) {
            console.error('Error en RatingRepository.addRating:', error);
            throw error;
        }
    }

    static async updateRating(rating: RatingDto) {
        try {
            // Verificar si existe la puntuación
            const existingRating = await this.getRating(rating.id_cliente, rating.id_establecimiento);
            if (existingRating === null) {
                throw new Error('No existe una puntuación para actualizar');
            }

            const sql = `
                UPDATE visualiza 
                SET puntuacion = $3
                WHERE fk_id_cliente = $1 AND fk_id_establecimiento = $2
                RETURNING puntuacion
            `;
            
            const result = await db.query(sql, [
                rating.id_cliente,
                rating.id_establecimiento,
                rating.puntuacion
            ]);

            return result.rows[0].puntuacion;
        } catch (error) {
            console.error('Error en RatingRepository.updateRating:', error);
            throw error;
        }
    }

    static async getRating(id_cliente: number, id_establecimiento: number) {
        try {
            const sql = `
                SELECT puntuacion 
                FROM visualiza 
                WHERE fk_id_cliente = $1 AND fk_id_establecimiento = $2
            `;
            
            const result = await db.query(sql, [id_cliente, id_establecimiento]);
            
            if (result.rows.length === 0) {
                return null;
            }

            return result.rows[0].puntuacion;
        } catch (error) {
            console.error('Error en RatingRepository.getRating:', error);
            throw error;
        }
    }

    static async deleteRating(id_cliente: number, id_establecimiento: number) {
        try {
            const sql = `
                DELETE FROM visualiza 
                WHERE fk_id_cliente = $1 AND fk_id_establecimiento = $2
                RETURNING puntuacion
            `;
            
            const result = await db.query(sql, [id_cliente, id_establecimiento]);
            return result.rows.length > 0;
        } catch (error) {
            console.error('Error en RatingRepository.deleteRating:', error);
            throw error;
        }
    }

    static async getAverageRating(id_establecimiento: number) {
        try {
            const sql = `
                SELECT 
                    e.nombre as nombreEstablecimiento,
                    v.fk_id_establecimiento as establecimientoId,
                    ROUND(AVG(v.puntuacion)::numeric, 1) as promedio
                FROM visualiza v
                INNER JOIN establecimiento e ON e.id_establecimiento = v.fk_id_establecimiento
                WHERE v.fk_id_establecimiento = $1
                GROUP BY v.fk_id_establecimiento, e.nombre
            `;
            
            const result = await db.query(sql, [id_establecimiento]);
            
            if (result.rows.length === 0) {
                return {
                    establecimientoId: id_establecimiento,
                    nombreEstablecimiento: null,
                    promedio: 0
                };
            }
    
            return {
                establecimientoId: result.rows[0].establecimientoid,
                nombreEstablecimiento: result.rows[0].nombreestablecimiento,
                promedio: result.rows[0].promedio
            };
        } catch (error) {
            console.error('Error en RatingRepository.getAverageRating:', error);
            throw error;
        }
    }
}

export default RatingRepository; 
