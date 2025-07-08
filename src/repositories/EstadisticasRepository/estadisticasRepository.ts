import db from '../../config/config-db';

class EstadisticasRepository {
    
    // Obtener estadísticas básicas de un establecimiento
    static async getEstadisticasGenerales(
        establecimientoId: number, 
        fechaInicio?: string, 
        fechaFin?: string
    ): Promise<any> {
        try {
            const whereClause = fechaInicio && fechaFin 
                ? `AND fecha_actividad BETWEEN $2 AND $3`
                : '';
            
            const params = fechaInicio && fechaFin 
                ? [establecimientoId, fechaInicio, fechaFin]
                : [establecimientoId];

            // Consulta simplificada para actividades
            const actividadQuery = `
                SELECT 
                    tipo_actividad,
                    COUNT(*) as total
                FROM actividad_establecimiento 
                WHERE fk_id_establecimiento = $1 ${whereClause}
                GROUP BY tipo_actividad
            `;
            
            // Consulta para puntuaciones
            const puntuacionesQuery = `
                SELECT 
                    COUNT(*) as total_puntuaciones,
                    COALESCE(AVG(valor_puntuado), 0) as promedio_puntuaciones
                FROM puntuacion 
                WHERE FK_id_establecimiento = $1
            `;

            // Consulta para comentarios
            const comentariosQuery = `
                SELECT COUNT(*) as total_comentarios
                FROM comentario 
                WHERE FK_id_establecimiento = $1
            `;

            const [actividadResult, puntuacionesResult, comentariosResult] = await Promise.all([
                db.query(actividadQuery, params),
                db.query(puntuacionesQuery, [establecimientoId]),
                db.query(comentariosQuery, [establecimientoId])
            ]);

            // Procesar resultados
            const actividad = {
                clics_perfil: 0,
                comentarios_totales: 0,
                favoritos_totales: 0,
                busquedas: 0
            };

            actividadResult.rows.forEach((row: any) => {
                switch (row.tipo_actividad) {
                    case 'clic_perfil':
                    case 'click_establecimiento':
                        actividad.clics_perfil += parseInt(row.total);
                        break;
                    case 'comentario':
                        actividad.comentarios_totales = parseInt(row.total);
                        break;
                    case 'favorito':
                        actividad.favoritos_totales = parseInt(row.total);
                        break;
                    case 'busqueda':
                        actividad.busquedas = parseInt(row.total);
                        break;
                }
            });

            const puntuacionRow = puntuacionesResult.rows[0] || {};
            const comentarioRow = comentariosResult.rows[0] || {};

            return {
                puntuaciones: {
                    total: parseInt(puntuacionRow.total_puntuaciones || 0),
                    promedio: parseFloat(puntuacionRow.promedio_puntuaciones || 0),
                    distribucion: {
                        cinco_estrellas: 0,
                        cuatro_estrellas: 0,
                        tres_estrellas: 0,
                        dos_estrellas: 0,
                        una_estrella: 0
                    }
                },
                actividad,
                comentarios: {
                    total: parseInt(comentarioRow.total_comentarios || 0),
                    sentimiento: {
                        positivos: 0,
                        neutrales: 0,
                        negativos: 0
                    },
                    porcentajes: {
                        positivos: 0,
                        neutrales: 0,
                        negativos: 0
                    }
                }
            };

        } catch (error) {
            console.error('❌ Error obteniendo estadísticas generales:', error);
            throw error;
        }
    }

    // Obtener actividad diaria simplificada
    static async getActividadDiaria(
        establecimientoId: number,
        fechaInicio: string,
        fechaFin: string
    ): Promise<any[]> {
        try {
            const query = `
                SELECT 
                    DATE(fecha_actividad) as fecha,
                    COUNT(*) as total
                FROM actividad_establecimiento
                WHERE fk_id_establecimiento = $1
                AND fecha_actividad BETWEEN $2 AND $3
                GROUP BY DATE(fecha_actividad)
                ORDER BY fecha
            `;

            const result = await db.query(query, [establecimientoId, fechaInicio, fechaFin]);
            
            return result.rows.map((row: any) => ({
                fecha: row.fecha,
                clics_perfil: 0,
                comentarios: 0,
                puntuaciones: 0,
                favoritos: 0,
                busquedas: 0,
                total: parseInt(row.total)
            }));

        } catch (error) {
            console.error('❌ Error obteniendo actividad diaria:', error);
            throw error;
        }
    }

    // Obtener totales por tipo de actividad
    static async getTotalesPorTipoActividad(
        establecimientoId: number,
        fechaInicio?: string,
        fechaFin?: string
    ): Promise<{ tipo: string; total: number }[]> {
        try {
            const whereClause = fechaInicio && fechaFin 
                ? `AND fecha_actividad BETWEEN $2 AND $3`
                : '';
            
            const params = fechaInicio && fechaFin 
                ? [establecimientoId, fechaInicio, fechaFin]
                : [establecimientoId];

            const query = `
                SELECT 
                    tipo_actividad as tipo,
                    COUNT(*) as total
                FROM actividad_establecimiento 
                WHERE fk_id_establecimiento = $1 ${whereClause}
                GROUP BY tipo_actividad
                ORDER BY total DESC
            `;

            const result = await db.query(query, params);
            
            return result.rows.map((row: any) => ({
                tipo: row.tipo,
                total: parseInt(row.total)
            }));

        } catch (error) {
            console.error('❌ Error obteniendo totales por tipo:', error);
            throw error;
        }
    }

    // Obtener tendencias simplificadas
    static async getTendencias(establecimientoId: number): Promise<{
        clics_vs_mes_anterior: number;
        comentarios_vs_mes_anterior: number;
        puntuacion_vs_mes_anterior: number;
    }> {
        try {
            // Por ahora retornar valores por defecto
            return {
                clics_vs_mes_anterior: 0,
                comentarios_vs_mes_anterior: 0,
                puntuacion_vs_mes_anterior: 0
            };

        } catch (error) {
            console.error('❌ Error obteniendo tendencias:', error);
            return {
                clics_vs_mes_anterior: 0,
                comentarios_vs_mes_anterior: 0,
                puntuacion_vs_mes_anterior: 0
            };
        }
    }

    // Verificar si el establecimiento pertenece al usuario
    static async verificarPropietario(establecimientoId: number, usuarioId: number): Promise<boolean> {
        try {
            const query = `
                SELECT 1 FROM establecimiento 
                WHERE id_establecimiento = $1 AND FK_id_usuario = $2
            `;
            
            const result = await db.query(query, [establecimientoId, usuarioId]);
            return result.rows.length > 0;
        } catch (error) {
            console.error('❌ Error verificando propietario:', error);
            return false;
        }
    }

    // Obtener información básica del establecimiento
    static async getInfoEstablecimiento(establecimientoId: number): Promise<{
        id: number;
        nombre: string;
        categoria: string;
    } | null> {
        try {
            const query = `
                SELECT 
                    e.id_establecimiento as id,
                    e.nombre_establecimiento as nombre,
                    ce.nombre as categoria
                FROM establecimiento e
                JOIN categoria_establecimiento ce ON e.FK_id_categoria_estab = ce.id_categoria_establecimiento
                WHERE e.id_establecimiento = $1
            `;
            
            const result = await db.query(query, [establecimientoId]);
            
            if (result.rows.length === 0) return null;
            
            return result.rows[0];
        } catch (error) {
            console.error('❌ Error obteniendo info del establecimiento:', error);
            return null;
        }
    }

    // Obtener establecimiento por usuario ID
    static async getEstablecimientoPorUsuario(usuarioId: number): Promise<{
        id: number;
        nombre: string;
        categoria: string;
    } | null> {
        try {
            const query = `
                SELECT 
                    e.id_establecimiento as id,
                    e.nombre_establecimiento as nombre,
                    ce.nombre as categoria
                FROM establecimiento e
                JOIN categoria_establecimiento ce ON e.FK_id_categoria_estab = ce.id_categoria_establecimiento
                WHERE e.FK_id_usuario = $1 AND e.estado = 'Aprobado'
            `;
            
            const result = await db.query(query, [usuarioId]);
            
            if (result.rows.length === 0) return null;
            
            return result.rows[0];
        } catch (error) {
            console.error('❌ Error obteniendo establecimiento por usuario:', error);
            return null;
        }
    }
}

export default EstadisticasRepository; 