import db from '../../config/config-db';

class DashboardRepository {
    static async getEstablecimientosStats() {
        try {
            const result = await db.query(`
                SELECT 
                    COUNT(*) as total,
                    COUNT(CASE WHEN estado = 'Aprobado' THEN 1 END) as activos,
                    COUNT(CASE WHEN estado = 'Suspendido' THEN 1 END) as suspendidos,
                    COUNT(CASE WHEN estado = 'Pendiente' THEN 1 END) as pendientes,
                    COUNT(CASE WHEN estado = 'Aprobado' AND created_at >= NOW() - INTERVAL '30 days' THEN 1 END) as nuevos
                FROM establecimiento
            `);
            return result.rows[0];
        } catch (error) {
            console.error('Error al obtener estadísticas de establecimientos:', error);
            throw error;
        }
    }

    static async getComentariosStats() {
        try {
            const result = await db.query(`
                SELECT 
                    COUNT(*) as total,
                    COUNT(CASE WHEN fecha_comentario >= NOW() - INTERVAL '7 days' THEN 1 END) as reportados
                FROM comentario
            `);
            return result.rows[0];
        } catch (error) {
            console.error('Error al obtener estadísticas de comentarios:', error);
            throw error;
        }
    }

    static async getUsuariosStats() {
        try {
            const result = await db.query(`
                SELECT 
                    COUNT(*) as total,
                    COUNT(CASE WHEN estado = 'Activo' THEN 1 END) as activos,
                    COUNT(CASE WHEN estado = 'Inactivo' THEN 1 END) as inactivos,
                    COUNT(CASE WHEN fecha_creacion >= NOW() - INTERVAL '30 days' THEN 1 END) as nuevos
                FROM usuario_general
            `);
            return result.rows[0];
        } catch (error) {
            console.error('Error al obtener estadísticas de usuarios:', error);
            throw error;
        }
    }

    static async getCategoriasStats() {
        try {
            const result = await db.query(`
                SELECT 
                    (SELECT COUNT(*) FROM categoria_establecimiento) as total_estab,
                    (SELECT COUNT(*) FROM categoria_producto) as total_prod
            `);
            return result.rows[0];
        } catch (error) {
            console.error('Error al obtener estadísticas de categorías:', error);
            throw error;
        }
    }

    static async getActividadesRecientes() {
        try {
            const result = await db.query(`
                (
                    SELECT 
                        'Nuevo establecimiento registrado' as action,
                        e.nombre_establecimiento as name,
                        e.created_at as time,
                        'establecimiento' as type
                    FROM establecimiento e
                    WHERE e.created_at >= NOW() - INTERVAL '7 days'
                    ORDER BY e.created_at DESC
                    LIMIT 5
                )
                UNION ALL
                (
                    SELECT 
                        'Nuevo comentario agregado' as action,
                        CONCAT('En ', est.nombre_establecimiento) as name,
                        c.fecha_comentario as time,
                        'comentario' as type
                    FROM comentario c
                    INNER JOIN establecimiento est ON c.FK_id_establecimiento = est.id_establecimiento
                    WHERE c.fecha_comentario >= NOW() - INTERVAL '7 days'
                    ORDER BY c.fecha_comentario DESC
                    LIMIT 5
                )
                UNION ALL
                (
                    SELECT 
                        'Nuevo usuario registrado' as action,
                        u.nombre as name,
                        u.fecha_creacion as time,
                        'usuario' as type
                    FROM usuario_general u
                    WHERE u.fecha_creacion >= NOW() - INTERVAL '7 days'
                    ORDER BY u.fecha_creacion DESC
                    LIMIT 5
                )
                ORDER BY time DESC
                LIMIT 10
            `);
            return result.rows;
        } catch (error) {
            console.error('Error al obtener actividades recientes:', error);
            throw error;
        }
    }
}

export default DashboardRepository; 