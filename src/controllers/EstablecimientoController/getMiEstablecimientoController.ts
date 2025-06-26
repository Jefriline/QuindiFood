import { Request, Response } from 'express';
import db from '../../config/config-db';

const getMiEstablecimiento = async (req: Request, res: Response) => {
    try {
        // Extraer ID del usuario del token (ya validado por middleware)
        const idUsuario = (req as any).user?.id;
        
        // Validación adicional por seguridad
        if (!idUsuario || typeof idUsuario !== 'number' || idUsuario <= 0) {
            return res.status(400).json({
                success: false,
                message: 'ID de usuario inválido'
            });
        }

        // Consulta SQL directa sin capas intermedias
        const sql = `
            SELECT 
                e.id_establecimiento,
                e.nombre_establecimiento,
                e.descripcion,
                e.ubicacion,
                e.telefono,
                e.contacto,
                e.estado,
                e.FK_id_categoria_estab,
                c.nombre as categoria,
                COALESCE(
                    (SELECT json_agg(
                        json_build_object(
                            'id_imagen', me.id_multimedia_estab,
                            'imagen', me.multimedia
                        )
                    ) FROM multimedia_establecimiento me WHERE me.FK_id_establecimiento = e.id_establecimiento),
                    '[]'::json
                ) as imagenes,
                COALESCE(
                    (SELECT json_build_object(
                        'registro_mercantil', de.registro_mercantil,
                        'rut', de.rut,
                        'certificado_salud', de.certificado_salud,
                        'registro_invima', de.registro_invima
                    ) FROM documentacion_establecimiento de WHERE de.FK_id_establecimiento = e.id_establecimiento),
                    '{}'::json
                ) as documentacion,
                COALESCE(
                    (SELECT json_agg(
                        json_build_object(
                            'dia', h.dia_semana,
                            'hora_apertura', h.hora_apertura,
                            'hora_cierre', h.hora_cierre
                        )
                    ) FROM horario_establecimiento h WHERE h.id_establecimiento = e.id_establecimiento),
                    '[]'::json
                ) as horarios,
                em.estado as estado_membresia,
                em.fecha_pago
            FROM establecimiento e
            INNER JOIN propietario_establecimiento pe ON e.FK_id_usuario = pe.id_propietario
            LEFT JOIN categoria_establecimiento c ON e.FK_id_categoria_estab = c.id_categoria_establecimiento
            LEFT JOIN estado_membresia em ON e.id_establecimiento = em.FK_id_establecimiento
            WHERE pe.id_propietario = $1
            LIMIT 1
        `;
        
        const result = await db.query(sql, [idUsuario]);
        
        if (result.rowCount === 0) {
            return res.status(404).json({
                success: false,
                message: 'No tienes un establecimiento registrado'
            });
        }
        
        const establecimiento = result.rows[0];
        
        return res.status(200).json({
            success: true,
            message: 'Establecimiento obtenido exitosamente',
            data: establecimiento
        });
        
    } catch (error: any) {
        console.error('Error al obtener mi establecimiento:', error);
        return res.status(500).json({
            success: false,
            message: 'Error al obtener el establecimiento',
            error: error?.message || 'Error desconocido'
        });
    }
};

export default getMiEstablecimiento; 