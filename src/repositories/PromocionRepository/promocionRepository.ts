import db from '../../config/config-db';

class PromocionRepository {
    static async verificarMembresiaPremium(idEstablecimiento: number): Promise<boolean> {
        try {
            const sql = `
                SELECT em.estado
                FROM estado_membresia em
                WHERE em.FK_id_establecimiento = $1
            `;
            const result = await db.query(sql, [idEstablecimiento]);
            
            if (result.rowCount === 0) {
                return false; // No tiene membresía
            }
            
            return result.rows[0].estado === 'Activo';
        } catch (error) {
            console.error('Error al verificar membresía premium:', error);
            throw error;
        }
    }

    static async crearPromocion(data: {
        encabezado: string,
        descripcion: string,
        imagen_promocional: string,
        fecha_inicio: Date,
        fecha_fin: Date,
        FK_id_establecimiento: number
    }) {
        try {
            // Verificar membresía premium primero
            const esPremium = await this.verificarMembresiaPremium(data.FK_id_establecimiento);
            if (!esPremium) {
                throw new Error('Tu establecimiento debe tener membresía premium activa para crear promociones');
            }

            const sql = `
                INSERT INTO promocion (
                    encabezado, 
                    descripcion, 
                    imagen_promocional, 
                    fecha_inicio, 
                    fecha_fin, 
                    FK_id_establecimiento
                ) VALUES ($1, $2, $3, $4, $5, $6) 
                RETURNING id_promocion
            `;
            
            const result = await db.query(sql, [
                data.encabezado,
                data.descripcion,
                data.imagen_promocional,
                data.fecha_inicio,
                data.fecha_fin,
                data.FK_id_establecimiento
            ]);
            
            return { id_promocion: result.rows[0].id_promocion };
        } catch (error) {
            console.error('Error al crear promoción:', error);
            throw error;
        }
    }

    static async getPromocionesByEstablecimiento(idEstablecimiento: number) {
        try {
            const sql = `
                SELECT 
                    p.id_promocion,
                    p.encabezado,
                    p.descripcion,
                    p.imagen_promocional,
                    p.fecha_inicio,
                    p.fecha_fin,
                    p.FK_id_establecimiento,
                    CASE 
                        WHEN p.fecha_fin < NOW() THEN 'Expirada'
                        WHEN p.fecha_inicio > NOW() THEN 'Programada'
                        ELSE 'Activa'
                    END as estado_promocion
                FROM promocion p
                WHERE p.FK_id_establecimiento = $1
                ORDER BY p.fecha_inicio DESC
            `;
            
            const result = await db.query(sql, [idEstablecimiento]);
            return result.rows;
        } catch (error) {
            console.error('Error al obtener promociones del establecimiento:', error);
            throw error;
        }
    }

    static async getPromocionById(idPromocion: number, idEstablecimiento: number) {
        try {
            const sql = `
                SELECT 
                    p.id_promocion,
                    p.encabezado,
                    p.descripcion,
                    p.imagen_promocional,
                    p.fecha_inicio,
                    p.fecha_fin,
                    p.FK_id_establecimiento,
                    CASE 
                        WHEN p.fecha_fin < NOW() THEN 'Expirada'
                        WHEN p.fecha_inicio > NOW() THEN 'Programada'
                        ELSE 'Activa'
                    END as estado_promocion
                FROM promocion p
                WHERE p.id_promocion = $1 AND p.FK_id_establecimiento = $2
            `;
            
            const result = await db.query(sql, [idPromocion, idEstablecimiento]);
            return result.rows[0] || null;
        } catch (error) {
            console.error('Error al obtener promoción por ID:', error);
            throw error;
        }
    }

    static async editarPromocion(
        idPromocion: number,
        idEstablecimiento: number,
        datosActualizados: any
    ) {
        try {
            // Verificar que la promoción pertenece al establecimiento
            const promocion = await this.getPromocionById(idPromocion, idEstablecimiento);
            if (!promocion) {
                throw new Error('Promoción no encontrada o no tienes permisos');
            }

            // Verificar membresía premium
            const esPremium = await this.verificarMembresiaPremium(idEstablecimiento);
            if (!esPremium) {
                throw new Error('Tu establecimiento debe tener membresía premium activa para editar promociones');
            }

            let updateFields = [];
            let values = [];
            let paramIndex = 1;
            
            if (datosActualizados.encabezado !== undefined) {
                updateFields.push(`encabezado = $${paramIndex}`);
                values.push(datosActualizados.encabezado);
                paramIndex++;
            }
            if (datosActualizados.descripcion !== undefined) {
                updateFields.push(`descripcion = $${paramIndex}`);
                values.push(datosActualizados.descripcion);
                paramIndex++;
            }
            if (datosActualizados.imagen_promocional !== undefined) {
                updateFields.push(`imagen_promocional = $${paramIndex}`);
                values.push(datosActualizados.imagen_promocional);
                paramIndex++;
            }
            if (datosActualizados.fecha_inicio !== undefined) {
                updateFields.push(`fecha_inicio = $${paramIndex}`);
                values.push(datosActualizados.fecha_inicio);
                paramIndex++;
            }
            if (datosActualizados.fecha_fin !== undefined) {
                updateFields.push(`fecha_fin = $${paramIndex}`);
                values.push(datosActualizados.fecha_fin);
                paramIndex++;
            }
            
            if (updateFields.length === 0) {
                throw new Error('No hay datos para actualizar');
            }
            
            values.push(idPromocion);
            const sql = `
                UPDATE promocion 
                SET ${updateFields.join(', ')}
                WHERE id_promocion = $${paramIndex}
                RETURNING id_promocion
            `;
            
            const result = await db.query(sql, values);
            return { id_promocion: result.rows[0].id_promocion, actualizado: true };
        } catch (error) {
            console.error('Error al editar promoción:', error);
            throw error;
        }
    }

    static async eliminarPromocion(idPromocion: number, idEstablecimiento: number) {
        try {
            // Verificar que la promoción pertenece al establecimiento
            const promocion = await this.getPromocionById(idPromocion, idEstablecimiento);
            if (!promocion) {
                throw new Error('Promoción no encontrada o no tienes permisos');
            }

            const sql = 'DELETE FROM promocion WHERE id_promocion = $1 AND FK_id_establecimiento = $2';
            const result = await db.query(sql, [idPromocion, idEstablecimiento]);
            
            if (result.rowCount === 0) {
                throw new Error('No se pudo eliminar la promoción');
            }
            
            return { id_promocion: idPromocion, eliminado: true };
        } catch (error) {
            console.error('Error al eliminar promoción:', error);
            throw error;
        }
    }

    // Método para obtener promociones activas públicamente
    static async getPromocionesActivasPublicas() {
        try {
            const sql = `
                SELECT 
                    p.id_promocion,
                    p.encabezado,
                    p.descripcion,
                    p.imagen_promocional,
                    p.fecha_inicio,
                    p.fecha_fin,
                    e.nombre_establecimiento,
                    e.id_establecimiento
                FROM promocion p
                INNER JOIN establecimiento e ON p.FK_id_establecimiento = e.id_establecimiento
                INNER JOIN estado_membresia em ON e.id_establecimiento = em.FK_id_establecimiento
                WHERE p.fecha_inicio <= NOW() 
                AND p.fecha_fin >= NOW()
                AND em.estado = 'Activo'
                AND e.estado = 'Aprobado'
                ORDER BY p.fecha_inicio DESC
            `;
            
            const result = await db.query(sql);
            return result.rows;
        } catch (error) {
            console.error('Error al obtener promociones activas:', error);
            throw error;
        }
    }

    static async getPromocionPublicaById(idPromocion: number) {
        try {
            const sql = `
                SELECT 
                    p.id_promocion,
                    p.FK_id_establecimiento as id_establecimiento,
                    p.encabezado,
                    p.descripcion,
                    p.imagen_promocional,
                    p.fecha_inicio,
                    p.fecha_fin
                FROM promocion p
                WHERE p.id_promocion = $1
            `;
            const result = await db.query(sql, [idPromocion]);
            return result.rows[0] || null;
        } catch (error) {
            console.error('Error al obtener promoción pública por ID:', error);
            throw error;
        }
    }
}

export default PromocionRepository; 