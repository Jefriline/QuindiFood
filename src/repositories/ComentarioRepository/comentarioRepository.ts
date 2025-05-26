import db from '../../config/config-db';
import { ComentarioDto } from '../../Dto/ComentarioDto/comentarioDto';

class ComentarioRepository {
    static async addComentario(comentario: ComentarioDto) {
        // Validar que el cliente existe
        const cliente = await db.query('SELECT * FROM cliente WHERE id_cliente = $1', [comentario.id_cliente]);
        if (cliente.rows.length === 0) {
            throw new Error('El cliente no existe');
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
            `INSERT INTO comentario (FK_id_cliente, FK_id_establecimiento, cuerpo_comentario, id_comentario_padre)
             VALUES ($1, $2, $3, $4) RETURNING *`,
            [comentario.id_cliente, comentario.id_establecimiento, comentario.cuerpo_comentario, comentario.id_comentario_padre || null]
        );
        return result.rows[0];
    }

    static async deleteComentarioByIdAndCliente(id_comentario: number, id_cliente: number) {
        // Verificar que el comentario existe y pertenece al cliente
        const comentario = await db.query('SELECT * FROM comentario WHERE id_comentario = $1', [id_comentario]);
        if (comentario.rows.length === 0) {
            throw new Error('El comentario no existe');
        }
        if (comentario.rows[0].fk_id_cliente !== id_cliente) {
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
        // Obtener todos los comentarios del establecimiento
        const result = await db.query(
            `SELECT * FROM comentario WHERE fk_id_establecimiento = $1 ORDER BY fecha ASC`,
            [id_establecimiento]
        );
        return result.rows;
    }

    static async getComentariosByCliente(id_cliente: number) {
        // Obtener todos los comentarios hechos por el cliente
        const result = await db.query(
            `SELECT * FROM comentario WHERE fk_id_cliente = $1 ORDER BY fecha ASC`,
            [id_cliente]
        );
        return result.rows;
    }

    static async getComentariosPrincipalesPaginados(id_establecimiento: number, limit: number, offset: number) {
        // Obtener comentarios principales (nivel 1) paginados
        const result = await db.query(
            `SELECT * FROM comentario WHERE fk_id_establecimiento = $1 AND id_comentario_padre IS NULL ORDER BY fecha ASC LIMIT $2 OFFSET $3`,
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
            `SELECT * FROM comentario WHERE id_comentario_padre = ANY($1::int[]) ORDER BY fecha ASC`,
            [ids_comentarios]
        );
        return result.rows;
    }
}

export default ComentarioRepository; 