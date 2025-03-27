import db from '../../config/config-db';
import { ListEstablecimientoDto } from '../../Dto/EstablecimientoDto/listEstablecimientoDto';

class ListEstablecimientoRepository {
    static async getAll(): Promise<ListEstablecimientoDto[]> {
        try {
            const sql = `
                SELECT 
                    e.id_establecimiento,
                    e.nombre,
                    e.descripcion,
                    array_agg(convert_from(m.multimedia, 'UTF8')) as multimedia_array
                FROM establecimiento e
                LEFT JOIN multimedia_establecimiento m ON e.id_establecimiento = m.fk_id_establecimiento
                GROUP BY e.id_establecimiento, e.nombre, e.descripcion
                ORDER BY e.id_establecimiento DESC
            `;
            
            const result = await db.query(sql);
            
            return result.rows.map(row => {
                const multimedia = row.multimedia_array 
                    ? row.multimedia_array.filter((item: any) => item !== null)
                    : [];

                return new ListEstablecimientoDto(
                    row.id_establecimiento,
                    row.nombre,
                    row.descripcion,
                    multimedia
                );
            });

        } catch (error) {
            console.error('Error al obtener establecimientos:', error);
            throw error;
        }
    }
}

export default ListEstablecimientoRepository; 