import { Pool } from 'pg';

export class EventRepository {
    constructor(private pool: Pool) {}

    async getAllEvents() {
        const result = await this.pool.query('SELECT * FROM eventos');
        return result.rows;
    }

    async getEventById(id: number) {
        const result = await this.pool.query('SELECT * FROM eventos WHERE id = $1', [id]);
        return result.rows[0];
    }

    async createEvent(eventData: any) {
        const { nombre, descripcion, fecha, hora, ubicacion, fk_id_establecimiento } = eventData;
        const result = await this.pool.query(
            'INSERT INTO eventos (nombre, descripcion, fecha, hora, ubicacion, fk_id_establecimiento) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [nombre, descripcion, fecha, hora, ubicacion, fk_id_establecimiento]
        );
        return result.rows[0];
    }

    async updateEvent(id: number, eventData: any) {
        const { nombre, descripcion, fecha, hora, ubicacion } = eventData;
        const result = await this.pool.query(
            'UPDATE eventos SET nombre = $1, descripcion = $2, fecha = $3, hora = $4, ubicacion = $5 WHERE id = $6 RETURNING *',
            [nombre, descripcion, fecha, hora, ubicacion, id]
        );
        return result.rows[0];
    }

    async deleteEvent(id: number) {
        const result = await this.pool.query('DELETE FROM eventos WHERE id = $1 RETURNING *', [id]);
        return result.rowCount ? result.rowCount > 0 : false;
    }
} 