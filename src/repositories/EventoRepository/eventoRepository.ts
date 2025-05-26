import db from '../../config/config-db';
import CrearEventoDto from '../../Dto/EventoDto/crearEventoDto';

class EventoRepository {
    static async crearEvento(evento: CrearEventoDto, id_admin: number) {
        const sql = `
            INSERT INTO evento (
                FK_id_administrador, nombre, descripcion, fecha_inicio, fecha_fin, imagen_evento
            ) VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *
        `;
        const values = [
            id_admin,
            evento.nombre,
            evento.descripcion,
            evento.fecha_inicio,
            evento.fecha_fin,
            evento.imagen_evento
        ];
        const result = await db.query(sql, values);
        return result.rows[0];
    }

    static async agregarParticipacion(participacion: any) {
        // Verificar que el evento existe
        const evento = await db.query('SELECT 1 FROM evento WHERE id_evento = $1', [participacion.id_evento]);
        if (evento.rows.length === 0) {
            throw new Error('El evento no existe');
        }
        // Verificar que el establecimiento existe
        const establecimiento = await db.query('SELECT 1 FROM establecimiento WHERE id_establecimiento = $1', [participacion.id_establecimiento]);
        if (establecimiento.rows.length === 0) {
            throw new Error('El establecimiento no existe');
        }
        // Verificar que no exista ya la participación
        const existe = await db.query(
            'SELECT 1 FROM participacion_evento WHERE FK_id_evento = $1 AND FK_id_establecimiento = $2',
            [participacion.id_evento, participacion.id_establecimiento]
        );
        if (existe.rows.length > 0) {
            throw new Error('El establecimiento ya está participando en este evento');
        }
        // Insertar participación
        const sql = `
            INSERT INTO participacion_evento (
                FK_id_evento, FK_id_establecimiento, titulo, precio, descripcion, imagen_participacion
            ) VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *
        `;
        const values = [
            participacion.id_evento,
            participacion.id_establecimiento,
            participacion.titulo,
            participacion.precio,
            participacion.descripcion,
            participacion.imagen_participacion
        ];
        const result = await db.query(sql, values);
        return result.rows[0];
    }

    static async updateEvento(id: number, updateFields: any) {
        if (!updateFields || Object.keys(updateFields).length === 0) return false;
        const campos = Object.keys(updateFields);
        const valores = Object.values(updateFields);
        const setClause = campos.map((campo, i) => `${campo} = $${i + 1}`).join(', ');
        const query = `UPDATE evento SET ${setClause} WHERE id_evento = $${campos.length + 1}`;
        const result = await db.query(query, [...valores, id]);
        return (result.rowCount ?? 0) > 0;
    }

    static async getEventoById(id: number) {
        const result = await db.query('SELECT * FROM evento WHERE id_evento = $1', [id]);
        return result.rows[0] || null;
    }

    static async eliminarEvento(id: number) {
        const query = 'DELETE FROM evento WHERE id_evento = $1';
        const result = await db.query(query, [id]);
        return (result.rowCount ?? 0) > 0;
    }


    static async getParticipacionByIdParticipacion(id_participacion: number) {
        const query = 'SELECT * FROM participacion_evento WHERE id_participacion = $1';
        const result = await db.query(query, [id_participacion]);
        return result.rows[0] || null;
    }

    static async updateParticipacionPorId(id_participacion: number, updateFields: any) {
        if (!updateFields || Object.keys(updateFields).length === 0) return false;
        const campos = Object.keys(updateFields);
        const valores = Object.values(updateFields);
        const setClause = campos.map((campo, i) => `${campo} = $${i + 1}`).join(', ');
        const query = `UPDATE participacion_evento SET ${setClause} WHERE id_participacion = $${campos.length + 1}`;
        const result = await db.query(query, [...valores, id_participacion]);
        return (result.rowCount ?? 0) > 0;
    }

    static async eliminarParticipacionPorId(id_participacion: number) {
        const query = 'DELETE FROM participacion_evento WHERE id_participacion = $1';
        const result = await db.query(query, [id_participacion]);
        return (result.rowCount ?? 0) > 0;
    }

    static async listarEventosPublico() {
        const query = `
            SELECT e.id_evento, e.nombre, e.descripcion, e.fecha_inicio, e.fecha_fin, e.imagen_evento,
                (SELECT COUNT(*) FROM participacion_evento p WHERE p.FK_id_evento = e.id_evento) AS total_participaciones
            FROM evento e
            ORDER BY e.fecha_inicio DESC
        `;
        const result = await db.query(query);
        const eventos = result.rows;
        // Obtener patrocinadores para cada evento
        for (const evento of eventos) {
            const patrocinadoresQuery = `SELECT id_patrocinador_evento as id_patrocinador, nombre, logo FROM patrocinador_evento WHERE FK_id_evento = $1`;
            const patrocinadoresResult = await db.query(patrocinadoresQuery, [evento.id_evento]);
            evento.patrocinadores = patrocinadoresResult.rows;
            evento.total_patrocinadores = patrocinadoresResult.rows.length;
        }
        return eventos;
    }

    static async detalleEventoPublico(id_evento: number) {
        // Obtener datos del evento y total de participaciones
        const eventoQuery = `
            SELECT e.id_evento, e.nombre, e.descripcion, e.fecha_inicio, e.fecha_fin, e.imagen_evento,
                (SELECT COUNT(*) FROM participacion_evento p WHERE p.FK_id_evento = e.id_evento) AS total_participaciones
            FROM evento e
            WHERE e.id_evento = $1
        `;
        const eventoResult = await db.query(eventoQuery, [id_evento]);
        if (eventoResult.rows.length === 0) return null;
        const evento = eventoResult.rows[0];
        // Patrocinadores
        const patrocinadoresQuery = `SELECT id_patrocinador_evento as id_patrocinador, nombre, logo FROM patrocinador_evento WHERE FK_id_evento = $1`;
        const patrocinadoresResult = await db.query(patrocinadoresQuery, [id_evento]);
        evento.patrocinadores = patrocinadoresResult.rows;
        evento.total_patrocinadores = patrocinadoresResult.rows.length;
        // Participaciones
        const participacionesQuery = `
            SELECT p.id_participacion, p.FK_id_establecimiento, p.titulo, p.descripcion, p.precio, p.imagen_participacion,
                est.nombre_establecimiento,
                COALESCE(array_agg(m.multimedia) FILTER (WHERE m.multimedia IS NOT NULL), '{}') AS imagenes_principales_establecimiento
            FROM participacion_evento p
            JOIN establecimiento est ON est.id_establecimiento = p.FK_id_establecimiento
            LEFT JOIN multimedia_establecimiento m ON m.FK_id_establecimiento = est.id_establecimiento
            WHERE p.FK_id_evento = $1
            GROUP BY p.id_participacion, est.id_establecimiento
        `;
        const participacionesResult = await db.query(participacionesQuery, [id_evento]);
        evento.participaciones = participacionesResult.rows;
        return evento;
    }

    static async agregarPatrocinador(id_evento: number, dto: { nombre: string, logo: string }) {
        const query = `
            INSERT INTO patrocinador_evento (FK_id_evento, nombre, logo)
            VALUES ($1, $2, $3)
            RETURNING *
        `;
        const result = await db.query(query, [id_evento, dto.nombre, dto.logo]);
        return result.rows[0];
    }

    static async editarPatrocinador(id_patrocinador_evento: number, updateFields: any) {
        if (!updateFields || Object.keys(updateFields).length === 0) return false;
        const campos = Object.keys(updateFields);
        const valores = Object.values(updateFields);
        const setClause = campos.map((campo, i) => `${campo} = $${i + 1}`).join(', ');
        const query = `UPDATE patrocinador_evento SET ${setClause} WHERE id_patrocinador_evento = $${campos.length + 1} RETURNING *`;
        const result = await db.query(query, [...valores, id_patrocinador_evento]);
        return result.rows[0];
    }

    static async eliminarPatrocinador(id_patrocinador_evento: number) {
        const query = `DELETE FROM patrocinador_evento WHERE id_patrocinador_evento = $1`;
        const result = await db.query(query, [id_patrocinador_evento]);
        return (result.rowCount ?? 0) > 0;
    }
}

export default EventoRepository; 