import db from '../../config/config-db';
import { FavoritoDto } from '../../Dto/FavoritoDto/favoritoDto';

class FavoritoRepository {
    static async addFavorito(favorito: FavoritoDto): Promise<boolean> {
        try {
            // Verificar si ya existe el favorito
            const existe = await db.query(
                'SELECT * FROM favorito WHERE FK_id_cliente = $1 AND FK_id_establecimiento = $2',
                [favorito.id_usuario, favorito.id_establecimiento]
            );

            if (existe.rows.length > 0) {
                return false; // Ya existe el favorito
            }

            // Verificar si el establecimiento existe y está activo
            const establecimiento = await db.query(
                `SELECT e.id_establecimiento 
                FROM establecimiento e 
                JOIN estado_membresia em ON e.id_establecimiento = em.FK_id_establecimiento 
                WHERE e.id_establecimiento = $1 AND em.estado = 'Activo'`,
                [favorito.id_establecimiento]
            );

            if (establecimiento.rows.length === 0) {
                throw new Error('El establecimiento no existe o no está activo');
            }

            // Verificar si el usuario existe y es un cliente
            const usuario = await db.query(
                'SELECT * FROM usuario_general WHERE id_usuario = $1',
                [favorito.id_usuario]
            );

            if (usuario.rows.length === 0) {
                throw new Error('El usuario no existe');
            }

            const cliente = await db.query(
                'SELECT * FROM cliente WHERE id_cliente = $1',
                [favorito.id_usuario]
            );

            if (cliente.rows.length === 0) {
                throw new Error('El usuario no es un cliente válido');
            }

            // Agregar el favorito
            await db.query(
                'INSERT INTO favorito (FK_id_cliente, FK_id_establecimiento) VALUES ($1, $2)',
                [favorito.id_usuario, favorito.id_establecimiento]
            );

            return true;
        } catch (error) {
            console.error('Error en el repositorio al agregar favorito:', error);
            throw error;
        }
    }

    static async removeFavorito(favorito: FavoritoDto): Promise<boolean> {
        try {
            // Verificar si existe el favorito
            const existe = await db.query(
                'SELECT * FROM favorito WHERE FK_id_cliente = $1 AND FK_id_establecimiento = $2',
                [favorito.id_usuario, favorito.id_establecimiento]
            );

            if (existe.rows.length === 0) {
                return false; // No existe el favorito
            }

            // Eliminar el favorito
            await db.query(
                'DELETE FROM favorito WHERE FK_id_cliente = $1 AND FK_id_establecimiento = $2',
                [favorito.id_usuario, favorito.id_establecimiento]
            );

            return true;
        } catch (error) {
            console.error('Error en el repositorio al eliminar favorito:', error);
            throw error;
        }
    }

    static async listFavoritosByCliente(id_usuario: number) {
        try {
            // Verificar si el usuario existe y es un cliente
            const usuario = await db.query(
                'SELECT * FROM usuario_general WHERE id_usuario = $1',
                [id_usuario]
            );

            if (usuario.rows.length === 0) {
                throw new Error('El usuario no existe');
            }

            const cliente = await db.query(
                'SELECT * FROM cliente WHERE id_cliente = $1',
                [id_usuario]
            );

            if (cliente.rows.length === 0) {
                throw new Error('El usuario no es un cliente válido');
            }

            const favoritos = await db.query(`
                SELECT 
                    e.id_establecimiento,
                    e.nombre_establecimiento,
                    e.ubicacion,
                    e.descripcion,
                    COALESCE(ia.imagenes_array, '[]'::json) as imagenes,
                    em.estado as estado_membresia,
                    COALESCE(punt.promedio,0) as promedio_calificacion,
                    COALESCE(punt.total,0) as total_puntuaciones
                FROM favorito f
                JOIN establecimiento e ON f.FK_id_establecimiento = e.id_establecimiento
                JOIN estado_membresia em ON e.id_establecimiento = em.FK_id_establecimiento
                LEFT JOIN (
                    SELECT FK_id_establecimiento,
                        json_agg(json_build_object('id_imagen', id_multimedia_estab, 'imagen', multimedia)) as imagenes_array
                    FROM multimedia_establecimiento
                    WHERE multimedia IS NOT NULL AND multimedia <> ''
                    GROUP BY FK_id_establecimiento
                ) ia ON e.id_establecimiento = ia.FK_id_establecimiento
                LEFT JOIN (
                    SELECT FK_id_establecimiento, AVG(valor_puntuado) as promedio, COUNT(*) as total
                    FROM puntuacion
                    GROUP BY FK_id_establecimiento
                ) punt ON e.id_establecimiento = punt.FK_id_establecimiento
                WHERE f.FK_id_cliente = $1
                ORDER BY e.nombre_establecimiento ASC
            `, [id_usuario]);

            if (favoritos.rows.length === 0) {
                throw new Error('El cliente no tiene establecimientos favoritos');
            }

            return favoritos.rows;
        } catch (error) {
            console.error('Error en el repositorio al listar favoritos:', error);
            throw error;
        }
    }

    static async getTotalFavoritosByEstablecimiento(id_establecimiento: number) {
        try {
            // Verificar si el establecimiento existe
            const establecimiento = await db.query(
                'SELECT * FROM establecimiento WHERE id_establecimiento = $1',
                [id_establecimiento]
            );

            if (establecimiento.rows.length === 0) {
                throw new Error('El establecimiento no existe');
            }

            const result = await db.query(
                'SELECT COUNT(*) as total FROM favorito WHERE FK_id_establecimiento = $1',
                [id_establecimiento]
            );

            const total = parseInt(result.rows[0].total);
            if (total === 0) {
                throw new Error('El establecimiento no tiene favoritos');
            }

            return total;
        } catch (error) {
            console.error('Error en el repositorio al obtener total de favoritos:', error);
            throw error;
        }
    }
}

export default FavoritoRepository; 