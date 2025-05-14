import db from '../../config/config-db';
import { ListEstablecimientoDto } from '../../Dto/EstablecimientoDto/listEstablecimientoDto';

class ListEstablecimientoRepository {
    static async getAll(): Promise<ListEstablecimientoDto[]> {
        try {
            const sql = `
                WITH imagenes_agrupadas AS (
                    SELECT 
                        FK_id_establecimiento,
                        json_agg(
                            json_build_object(
                                'id_imagen', id_multimedia_estab,
                                'imagen', multimedia
                            )
                        ) as imagenes_array
                    FROM multimedia_establecimiento
                    WHERE multimedia IS NOT NULL AND multimedia <> ''
                    GROUP BY FK_id_establecimiento
                ),
                horarios_agrupados AS (
                    SELECT 
                        id_establecimiento,
                        json_agg(
                            json_build_object(
                                'dia', dia_semana,
                                'hora_apertura', hora_apertura,
                                'hora_cierre', hora_cierre
                            )
                        ) as horarios_array
                    FROM horario_establecimiento
                    GROUP BY id_establecimiento
                ),
                puntuaciones_agrupadas AS (
                    SELECT 
                        FK_id_establecimiento,
                        AVG(valor_puntuado) as promedio,
                        COUNT(*) as total
                    FROM puntuacion
                    GROUP BY FK_id_establecimiento
                )
                SELECT 
                    e.id_establecimiento,
                    e.nombre_establecimiento,
                    e.descripcion,
                    e.ubicacion,
                    c.nombre as categoria,
                    COALESCE(ia.imagenes_array, '[]'::json) as imagenes,
                    em.estado as estado_membresia,
                    COALESCE(punt.promedio, 0) as promedio_calificacion,
                    COALESCE(punt.total, 0) as total_puntuaciones,
                    COALESCE(h.horarios_array, '[]'::json) as horarios
                FROM establecimiento e
                LEFT JOIN categoria_establecimiento c ON e.FK_id_categoria_estab = c.id_categoria_establecimiento
                LEFT JOIN imagenes_agrupadas ia ON e.id_establecimiento = ia.FK_id_establecimiento
                LEFT JOIN estado_membresia em ON e.id_establecimiento = em.FK_id_establecimiento
                LEFT JOIN puntuaciones_agrupadas punt ON e.id_establecimiento = punt.FK_id_establecimiento
                LEFT JOIN horarios_agrupados h ON e.id_establecimiento = h.id_establecimiento
                ORDER BY 
                    CASE WHEN em.estado = 'Activo' THEN 1 ELSE 0 END DESC,
                    e.id_establecimiento DESC
            `;
            
            const result = await db.query(sql);
            
            return result.rows.map(row => {
                const imagenes = Array.isArray(row.imagenes) ? row.imagenes : [];
                return new ListEstablecimientoDto(
                    row.id_establecimiento,
                    row.nombre_establecimiento,
                    row.descripcion,
                    row.ubicacion,
                    row.categoria,
                    imagenes,
                    row.estado_membresia,
                    parseFloat(row.promedio_calificacion),
                    row.horarios || []
                );
            });

        } catch (error) {
            console.error('Error al obtener establecimientos:', error);
            throw error;
        }
    }

    static async getEstablecimientoById(id: number): Promise<any> {
        const result = await db.query(`
            SELECT e.id_establecimiento, e.nombre_establecimiento, e.descripcion, e.ubicacion,
                ce.id_categoria_establecimiento,
                ce.nombre AS categoria,
                COALESCE(ia.imagenes_array, '[]'::json) as imagenes,
                em.estado,
                COALESCE(punt.promedio,0) as promedio_calificacion,
                COALESCE(punt.total,0) as total_puntuaciones,
                COALESCE(horarios.horarios_array, '[]'::json) as horarios
            FROM establecimiento e
            JOIN estado_membresia em ON e.id_establecimiento = em.FK_id_establecimiento
            JOIN categoria_establecimiento ce ON e.FK_id_categoria_estab = ce.id_categoria_establecimiento
            LEFT JOIN (
                SELECT FK_id_establecimiento,
                    json_agg(json_build_object('id_imagen', id_multimedia_estab, 'imagen', multimedia)) as imagenes_array
                FROM multimedia_establecimiento
                WHERE multimedia IS NOT NULL AND multimedia <> ''
                GROUP BY FK_id_establecimiento
            ) ia ON e.id_establecimiento = ia.FK_id_establecimiento
            LEFT JOIN (
                SELECT id_establecimiento,
                    json_agg(json_build_object('dia_semana', dia_semana, 'hora_apertura', hora_apertura, 'hora_cierre', hora_cierre) ORDER BY 
                        CASE dia_semana
                            WHEN 'Lunes' THEN 1
                            WHEN 'Martes' THEN 2
                            WHEN 'Miércoles' THEN 3
                            WHEN 'Jueves' THEN 4
                            WHEN 'Viernes' THEN 5
                            WHEN 'Sábado' THEN 6
                            WHEN 'Domingo' THEN 7
                        END
                    ) as horarios_array
                FROM horario_establecimiento
                GROUP BY id_establecimiento
            ) horarios ON e.id_establecimiento = horarios.id_establecimiento
            LEFT JOIN (
                SELECT FK_id_establecimiento, AVG(valor_puntuado) as promedio, COUNT(*) as total
                FROM puntuacion
                GROUP BY FK_id_establecimiento
            ) punt ON e.id_establecimiento = punt.FK_id_establecimiento
            WHERE e.id_establecimiento = $1
        `, [id]);
        return result.rows[0];
    }

    static async getEstadoEstablecimiento(id: number): Promise<boolean> {
        const result = await db.query(`
            SELECT dia_semana, hora_apertura, hora_cierre
            FROM horario_establecimiento
            WHERE id_establecimiento = $1
        `, [id]);
        if (!result.rows.length) return false;
        const horarios = result.rows;
        const dias = ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'];
        const now = new Date();
        const diaSemana = dias[now.getDay()];
        const horaActual = now.toTimeString().slice(0,5);
        const abierto = horarios.some((h: any) =>
            h.dia_semana === diaSemana &&
            h.hora_apertura <= horaActual &&
            h.hora_cierre > horaActual
        );
        return abierto;
    }
}

export default ListEstablecimientoRepository; 