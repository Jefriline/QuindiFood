import db from '../../config/config-db';
import { EstablecimientoCompletoDto } from '../../Dto/EstablecimientoDto/establecimientoCompletoDto';

class EstablecimientoCompletoRepository {
    static async getAll(): Promise<EstablecimientoCompletoDto[]> {
        try {
            const dias = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
            const now = new Date();
            const diaSemana = dias[now.getDay()];
            const horaActual = now.toTimeString().slice(0, 5); // 'HH:MM'

            const sql = `
                WITH establecimientos_info AS (
                    SELECT 
                        e.id_establecimiento,
                        e.nombre_establecimiento,
                        e.descripcion,
                        e.ubicacion,
                        ce.nombre AS categoria,
                        me.multimedia AS imagen,
                        em.estado as estado_membresia,
                        COALESCE(punt.promedio, 0) as promedio,
                        h.dia_semana,
                        h.hora_apertura,
                        h.hora_cierre,
                        CASE 
                            WHEN h.dia_semana = $1 
                            AND h.hora_apertura <= $2 
                            AND h.hora_cierre > $2 
                            THEN true 
                            ELSE false 
                        END as esta_abierto,
                        CASE 
                            WHEN h.dia_semana = 'Lunes' THEN 1
                            WHEN h.dia_semana = 'Martes' THEN 2
                            WHEN h.dia_semana = 'Miércoles' THEN 3
                            WHEN h.dia_semana = 'Jueves' THEN 4
                            WHEN h.dia_semana = 'Viernes' THEN 5
                            WHEN h.dia_semana = 'Sábado' THEN 6
                            WHEN h.dia_semana = 'Domingo' THEN 7
                        END as orden_dia
                    FROM establecimiento e
                    JOIN estado_membresia em ON e.id_establecimiento = em.FK_id_establecimiento
                    JOIN categoria_establecimiento ce ON e.FK_id_categoria_estab = ce.id_categoria_establecimiento
                    LEFT JOIN multimedia_establecimiento me ON e.id_establecimiento = me.FK_id_establecimiento
                    LEFT JOIN horario_establecimiento h ON e.id_establecimiento = h.id_establecimiento
                    LEFT JOIN (
                        SELECT FK_id_establecimiento, AVG(valor_puntuado) as promedio
                        FROM puntuacion
                        GROUP BY FK_id_establecimiento
                    ) punt ON e.id_establecimiento = punt.FK_id_establecimiento
                )
                SELECT 
                    id_establecimiento,
                    nombre_establecimiento,
                    descripcion,
                    ubicacion,
                    categoria,
                    imagen,
                    estado_membresia,
                    promedio,
                    bool_or(esta_abierto) as esta_abierto,
                    json_agg(
                        json_build_object(
                            'dia', dia_semana,
                            'hora_apertura', hora_apertura,
                            'hora_cierre', hora_cierre
                        ) ORDER BY orden_dia
                    ) as horarios
                FROM establecimientos_info
                GROUP BY 
                    id_establecimiento,
                    nombre_establecimiento,
                    descripcion,
                    ubicacion,
                    categoria,
                    imagen,
                    estado_membresia,
                    promedio
                ORDER BY 
                    CASE WHEN estado_membresia = 'activo' THEN 0 ELSE 1 END,
                    promedio DESC
            `;

            const result = await db.query(sql, [diaSemana, horaActual]);

            return result.rows.map(row => new EstablecimientoCompletoDto(
                row.id_establecimiento,
                row.nombre_establecimiento,
                row.descripcion,
                row.ubicacion,
                row.categoria,
                row.imagen,
                row.estado_membresia,
                parseFloat(row.promedio),
                row.esta_abierto,
                row.horarios
            ));

        } catch (error) {
            console.error('Error al obtener establecimientos completos:', error);
            throw error;
        }
    }
}

export default EstablecimientoCompletoRepository; 