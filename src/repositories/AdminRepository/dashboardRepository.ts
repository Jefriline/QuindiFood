import db from '../../config/config-db';

class DashboardRepository {
    static async getEstablecimientosStats() {
        try {
            const result = await db.query(`
                SELECT 
                    COUNT(*) as total,
                    SUM(CASE WHEN estado = 'Aprobado' THEN 1 ELSE 0 END) as activos,
                    SUM(CASE WHEN estado = 'Suspendido' THEN 1 ELSE 0 END) as suspendidos,
                    SUM(CASE WHEN estado = 'Pendiente' THEN 1 ELSE 0 END) as pendientes,
                    SUM(CASE WHEN estado = 'Aprobado' AND created_at >= CURRENT_DATE - INTERVAL '30 days' THEN 1 ELSE 0 END) as nuevos
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
                    SUM(CASE WHEN fecha_comentario >= CURRENT_DATE - INTERVAL '7 days' THEN 1 ELSE 0 END) as reportados
                FROM comentario
                WHERE fecha_comentario IS NOT NULL
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
                    SUM(CASE WHEN estado = 'Activo' THEN 1 ELSE 0 END) as activos,
                    SUM(CASE WHEN estado = 'Inactivo' THEN 1 ELSE 0 END) as inactivos,
                    SUM(CASE WHEN fecha_creacion >= CURRENT_DATE - INTERVAL '30 days' THEN 1 ELSE 0 END) as nuevos
                FROM usuario_general
                WHERE fecha_creacion IS NOT NULL
            `);
            return result.rows[0];
        } catch (error) {
            console.error('Error al obtener estadísticas de usuarios:', error);
            throw error;
        }
    }

    static async getCategoriasStats() {
        try {
            const [establResult, prodResult] = await Promise.all([
                db.query('SELECT COUNT(*) as count FROM categoria_establecimiento'),
                db.query('SELECT COUNT(*) as count FROM categoria_producto')
            ]);
            
            return {
                total_estab: establResult.rows[0].count,
                total_prod: prodResult.rows[0].count
            };
        } catch (error) {
            console.error('Error al obtener estadísticas de categorías:', error);
            throw error;
        }
    }

    static async getActividadesRecientes() {
        try {
            const result = await db.query(`
                SELECT 
                    activity_type,
                    activity_name,
                    activity_time,
                    activity_detail
                FROM (
                    SELECT 
                        'establecimiento' as activity_type,
                        nombre_establecimiento as activity_name,
                        created_at as activity_time,
                        'Nuevo establecimiento registrado' as activity_detail
                    FROM establecimiento 
                    WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'
                    ORDER BY created_at DESC
                    LIMIT 3
                ) sub1
                
                UNION ALL
                
                SELECT 
                    activity_type,
                    activity_name,
                    activity_time,
                    activity_detail
                FROM (
                    SELECT 
                        'comentario' as activity_type,
                        'Comentario en establecimiento' as activity_name,
                        fecha_comentario as activity_time,
                        'Nuevo comentario agregado' as activity_detail
                    FROM comentario 
                    WHERE fecha_comentario >= CURRENT_DATE - INTERVAL '7 days'
                    ORDER BY fecha_comentario DESC
                    LIMIT 3
                ) sub2
                
                UNION ALL
                
                SELECT 
                    activity_type,
                    activity_name,
                    activity_time,
                    activity_detail
                FROM (
                    SELECT 
                        'usuario' as activity_type,
                        nombre as activity_name,
                        fecha_creacion as activity_time,
                        'Nuevo usuario registrado' as activity_detail
                    FROM usuario_general 
                    WHERE fecha_creacion >= CURRENT_DATE - INTERVAL '7 days'
                    ORDER BY fecha_creacion DESC
                    LIMIT 3
                ) sub3
                
                ORDER BY activity_time DESC
                LIMIT 10
            `);
            return result.rows;
        } catch (error) {
            console.error('Error al obtener actividades recientes:', error);
            return [
                {
                    activity_type: 'sistema',
                    activity_name: 'Sistema iniciado',
                    activity_time: new Date(),
                    activity_detail: 'El sistema está funcionando correctamente'
                }
            ];
        }
    }

    static async getEstablecimientosPendientes() {
        try {
            const result = await db.query(`
                SELECT 
                    id_establecimiento,
                    nombre_establecimiento,
                    categoria,
                    created_at,
                    estado
                FROM establecimiento 
                WHERE estado = 'Pendiente'
                ORDER BY created_at DESC
                LIMIT 5
            `);
            return result.rows;
        } catch (error) {
            console.error('Error al obtener establecimientos pendientes:', error);
            return [];
        }
    }

    static async getEstablecimientosRecientes() {
        try {
            const result = await db.query(`
                SELECT 
                    id_establecimiento,
                    nombre_establecimiento,
                    categoria,
                    created_at,
                    estado
                FROM establecimiento 
                WHERE estado IN ('Aprobado', 'Rechazado')
                ORDER BY created_at DESC
                LIMIT 5
            `);
            return result.rows;
        } catch (error) {
            console.error('Error al obtener establecimientos recientes:', error);
            return [];
        }
    }

    static async getTotalVisitasEstablecimientos() {
        try {
            const result = await db.query(`
                SELECT COUNT(*) as total
                FROM actividad_establecimiento
                WHERE tipo_actividad = 'click_establecimiento'
            `);
            return parseInt(result.rows[0].total, 10) || 0;
        } catch (error) {
            console.error('Error al obtener total de visitas a establecimientos:', error);
            throw error;
        }
    }

    static async getDashboardStats() {
        try {
            // Ejecutar todas las consultas en paralelo
            const [usuariosAprobados, usuariosPendientes, totalComentarios, establecimientosPendientes, establecimientosRechazados, establecimientosMembresiaActiva, totalClicks] = await Promise.all([
                db.query(`SELECT COUNT(*)::int as total FROM usuario_general WHERE estado = 'Aprobado'`),
                db.query(`SELECT COUNT(*)::int as total FROM usuario_general WHERE estado = 'Pendiente'`),
                db.query(`SELECT COUNT(*)::int as total FROM comentario`),
                db.query(`SELECT COUNT(*)::int as total FROM establecimiento WHERE estado = 'Pendiente'`),
                db.query(`SELECT COUNT(*)::int as total FROM establecimiento WHERE estado = 'Rechazado'`),
                db.query(`SELECT COUNT(DISTINCT FK_id_establecimiento)::int as total FROM estado_membresia WHERE estado = 'Activo'`),
                db.query(`SELECT COUNT(*)::int as total FROM actividad_establecimiento WHERE tipo_actividad = 'click_establecimiento'`)
            ]);
            return {
                usuarios_aprobados: usuariosAprobados.rows[0].total,
                usuarios_pendientes: usuariosPendientes.rows[0].total,
                total_comentarios: totalComentarios.rows[0].total,
                establecimientos_pendientes: establecimientosPendientes.rows[0].total,
                establecimientos_rechazados: establecimientosRechazados.rows[0].total,
                establecimientos_membresia_activa: establecimientosMembresiaActiva.rows[0].total,
                interacciones_establecimientos: totalClicks.rows[0].total
            };
        } catch (error) {
            console.error('Error al obtener estadísticas del dashboard:', error);
            throw error;
        }
    }
}

export default DashboardRepository; 