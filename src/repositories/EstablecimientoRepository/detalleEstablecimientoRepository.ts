import db from '../../config/config-db';
import { DetalleEstablecimientoDto } from '../../Dto/EstablecimientoDto/detalleEstablecimientoDto';

class DetalleEstablecimientoRepository {
    static async getById(id: number): Promise<DetalleEstablecimientoDto | null> {
        try {
            const sql = `
                SELECT 
                    e.id_establecimiento,
                    e.nombre,
                    e.ubicacion,
                    e.telefono,
                    e.descripcion,
                    array_agg(DISTINCT convert_from(m.multimedia, 'UTF8')) as multimedia_array,
                    array_agg(DISTINCT c.url) as contactos_array
                FROM establecimiento e
                LEFT JOIN multimedia_establecimiento m ON e.id_establecimiento = m.fk_id_establecimiento
                LEFT JOIN Contacto_establecimiento c ON e.id_establecimiento = c.fk_id_establecimiento
                WHERE e.id_establecimiento = $1
                GROUP BY e.id_establecimiento, e.nombre, e.ubicacion, e.telefono, e.descripcion
            `;
            
            const result = await db.query(sql, [id]);
            
            if (result.rows.length === 0) {
                return null;
            }

            const row = result.rows[0];
            return new DetalleEstablecimientoDto(
                row.id_establecimiento,
                row.nombre,
                row.ubicacion,
                row.telefono,
                row.descripcion,
                row.multimedia_array.filter((item: any) => item !== null),
                row.contactos_array.filter((item: any) => item !== null)
            );

        } catch (error) {
            console.error('Error al obtener detalle del establecimiento:', error);
            throw error;
        }
    }
}

export default DetalleEstablecimientoRepository; 