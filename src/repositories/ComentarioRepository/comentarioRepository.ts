import db from '../../config/config-db';
import { ComentarioDto } from '../../Dto/ComentarioDto/comentarioDto';

class ComentarioRepository {
    static async addComentario(comentario: ComentarioDto) {
        // Validar que el usuario existe (cualquier rol: CLIENTE, PROPIETARIO, ADMIN)
        const usuario = await db.query('SELECT * FROM usuario_general WHERE id_usuario = $1', [comentario.id_usuario ]);
        if (usuario.rows.length === 0) {
            throw new Error('El usuario no existe');
        }
        // Validar que el establecimiento existe
        const establecimiento = await db.query('SELECT * FROM establecimiento WHERE id_establecimiento = $1', [comentario.id_establecimiento]);
        if (establecimiento.rows.length === 0) {
            throw new Error('El establecimiento no existe');
        }
        // Si es respuesta, validar que el comentario padre existe y pertenece al mismo establecimiento
        if (comentario.id_comentario_padre) {
            const padre = await db.query('SELECT * FROM comentario WHERE id_comentario = $1', [comentario.id_comentario_padre]);
            if (padre.rows.length === 0) {
                throw new Error('El comentario padre no existe');
            }
            if (padre.rows[0].fk_id_establecimiento !== comentario.id_establecimiento) {
                throw new Error('El comentario padre no pertenece al mismo establecimiento');
            }
        }
        // Insertar comentario
        const result = await db.query(
            `INSERT INTO comentario (fk_id_usuario, fk_id_establecimiento, cuerpo_comentario, id_comentario_padre)
             VALUES ($1, $2, $3, $4) RETURNING *`,
            [comentario.id_usuario, comentario.id_establecimiento, comentario.cuerpo_comentario, comentario.id_comentario_padre || null]
        );
        return result.rows[0];
    }

    static async deleteComentarioByIdAndUsuario(id_comentario: number, id_usuario: number) {
        // Verificar que el comentario existe y pertenece al usuario (cualquier rol)
        const comentario = await db.query('SELECT * FROM comentario WHERE id_comentario = $1', [id_comentario]);
        if (comentario.rows.length === 0) {
            throw new Error('El comentario no existe');
        }
        if (comentario.rows[0].fk_id_usuario !== id_usuario) {
            throw new Error('No tienes permiso para eliminar este comentario');
        }
        await db.query('DELETE FROM comentario WHERE id_comentario = $1', [id_comentario]);
        return true;
    }

    static async deleteComentarioByIdAdmin(id_comentario: number) {
        // Verificar que el comentario existe
        const comentario = await db.query('SELECT * FROM comentario WHERE id_comentario = $1', [id_comentario]);
        if (comentario.rows.length === 0) {
            throw new Error('El comentario no existe');
        }
        await db.query('DELETE FROM comentario WHERE id_comentario = $1', [id_comentario]);
        return true;
    }

    static async getComentariosByEstablecimiento(id_establecimiento: number) {
        // Obtener todos los comentarios del establecimiento con foto de perfil
        const result = await db.query(
            `SELECT c.*, u.nombre as nombre_usuario, u.email, u.foto_perfil
             FROM comentario c
             LEFT JOIN usuario_general u ON c.fk_id_usuario = u.id_usuario
             WHERE c.fk_id_establecimiento = $1 ORDER BY c.fecha ASC`,
            [id_establecimiento]
        );
        return result.rows;
    }

    static async getComentariosByCliente(id_usuario: number) {
        // Obtener todos los comentarios hechos por el cliente
        const result = await db.query(
            `SELECT * FROM comentario WHERE fk_id_usuario = $1 ORDER BY fecha ASC`,
            [id_usuario]
        );
        return result.rows;
    }

    static async getComentariosPrincipalesPaginados(id_establecimiento: number, limit: number, offset: number) {
        // Obtener comentarios principales (nivel 1) paginados con información del usuario y foto
        const result = await db.query(
            `SELECT 
                c.id_comentario,
                c.fk_id_usuario,
                c.fk_id_establecimiento,
                c.cuerpo_comentario,
                c.fecha,
                c.id_comentario_padre,
                u.nombre as nombre_usuario,
                u.email,
                u.foto_perfil
             FROM comentario c
             LEFT JOIN usuario_general u ON c.fk_id_usuario = u.id_usuario
             WHERE c.fk_id_establecimiento = $1 AND c.id_comentario_padre IS NULL 
             ORDER BY c.fecha ASC 
             LIMIT $2 OFFSET $3`,
            [id_establecimiento, limit, offset]
        );
        return result.rows;
    }

    static async countComentariosPrincipales(id_establecimiento: number) {
        const result = await db.query(
            `SELECT COUNT(*) FROM comentario WHERE fk_id_establecimiento = $1 AND id_comentario_padre IS NULL`,
            [id_establecimiento]
        );
        return parseInt(result.rows[0].count);
    }

    static async countComentariosTotales(id_establecimiento: number) {
        const result = await db.query(
            `SELECT COUNT(*) FROM comentario WHERE fk_id_establecimiento = $1`,
            [id_establecimiento]
        );
        return parseInt(result.rows[0].count);
    }

    static async getRespuestasDeComentarios(ids_comentarios: number[]) {
        if (ids_comentarios.length === 0) return [];
        const result = await db.query(
            `SELECT 
                c.id_comentario,
                c.fk_id_usuario,
                c.fk_id_establecimiento,
                c.cuerpo_comentario,
                c.fecha,
                c.id_comentario_padre,
                u.nombre as nombre_usuario,
                u.email,
                u.foto_perfil
             FROM comentario c
             LEFT JOIN usuario_general u ON c.fk_id_usuario = u.id_usuario
             WHERE c.id_comentario_padre = ANY($1::int[]) 
             ORDER BY c.fecha ASC`,
            [ids_comentarios]
        );
        return result.rows;
    }
}

export default ComentarioRepository; 