import db from "../../config/config-db";
import RatingDto from "../../Dto/UserDto/ratingDto";

class RatingRepository {
    static async addRating(rating: RatingDto) {
        try {
            // Verificar si el cliente existe
            const clienteCheck = await db.query(
                "SELECT * FROM cliente WHERE id_cliente = $1",
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
                INSERT INTO puntuacion (FK_id_cliente, FK_id_establecimiento, valor_puntuado)
                VALUES ($1, $2, $3)
                RETURNING valor_puntuado
            `;
            
            const result = await db.query(sql, [
                rating.id_cliente,
                rating.id_establecimiento,
                rating.puntuacion
            ]);

            return result.rows[0].valor_puntuado;
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
                UPDATE puntuacion 
                SET valor_puntuado = $3
                WHERE FK_id_cliente = $1 AND FK_id_establecimiento = $2
                RETURNING valor_puntuado
            `;
            
            const result = await db.query(sql, [
                rating.id_cliente,
                rating.id_establecimiento,
                rating.puntuacion
            ]);

            return result.rows[0].valor_puntuado;
        } catch (error) {
            console.error('Error en RatingRepository.updateRating:', error);
            throw error;
        }
    }

    static async getRating(id_cliente: number, id_establecimiento: number) {
        try {
            const sql = `
                SELECT valor_puntuado, FK_id_establecimiento
                FROM puntuacion 
                WHERE FK_id_cliente = $1 AND FK_id_establecimiento = $2
            `;
            
            const result = await db.query(sql, [id_cliente, id_establecimiento]);
            
            if (result.rows.length === 0) {
                return null;
            }

            return {
                puntuacion: result.rows[0].valor_puntuado,
                id_establecimiento: result.rows[0].fk_id_establecimiento
            };
        } catch (error) {
            console.error('Error en RatingRepository.getRating:', error);
            throw error;
        }
    }

    static async deleteRating(id_cliente: number, id_establecimiento: number) {
        try {
            const sql = `
                DELETE FROM puntuacion 
                WHERE FK_id_cliente = $1 AND FK_id_establecimiento = $2
                RETURNING valor_puntuado
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
            // Primero verificar si el establecimiento existe
            const establecimientoCheck = await db.query(
                "SELECT * FROM establecimiento WHERE id_establecimiento = $1",
                [id_establecimiento]
            );

            if (establecimientoCheck.rows.length === 0) {
                throw new Error('El establecimiento no existe');
            }

            const sql = `
                SELECT 
                    e.nombre_establecimiento as nombreEstablecimiento,
                    p.FK_id_establecimiento as establecimientoId,
                    ROUND(AVG(p.valor_puntuado)::numeric, 1) as promedio,
                    COUNT(p.valor_puntuado) as total_puntuaciones
                FROM puntuacion p
                INNER JOIN establecimiento e ON e.id_establecimiento = p.FK_id_establecimiento
                WHERE p.FK_id_establecimiento = $1
                GROUP BY p.FK_id_establecimiento, e.nombre_establecimiento
            `;
            
            const result = await db.query(sql, [id_establecimiento]);
            
            if (result.rows.length === 0) {
                return {
                    establecimientoId: id_establecimiento,
                    nombreEstablecimiento: establecimientoCheck.rows[0].nombre_establecimiento,
                    promedio: 0,
                    total_puntuaciones: 0
                };
            }
    
            return {
                establecimientoId: result.rows[0].establecimientoid,
                nombreEstablecimiento: result.rows[0].nombreestablecimiento,
                promedio: result.rows[0].promedio,
                total_puntuaciones: parseInt(result.rows[0].total_puntuaciones)
            };
        } catch (error) {
            console.error('Error en RatingRepository.getAverageRating:', error);
            throw error;
        }
    }
}

export default RatingRepository; 
