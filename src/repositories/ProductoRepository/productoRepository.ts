import db from '../../config/config-db';

class ProductoRepository {
    static async crearProducto(data: {
        nombre: string,
        precio: number,
        descripcion?: string,
        FK_id_categoria_producto: number,
        FK_id_establecimiento: number,
        multimedia?: { tipo: 'foto' | 'video', ref: string }[]
    }) {
        const client = await db.connect();
        try {
            await client.query('BEGIN');
            
            // Insertar producto
            const result = await client.query(
                `INSERT INTO producto (nombre, precio, descripcion, FK_id_establecimiento, FK_id_categoria_producto)
                 VALUES ($1, $2, $3, $4, $5) RETURNING id_producto`,
                [data.nombre, data.precio, data.descripcion, data.FK_id_establecimiento, data.FK_id_categoria_producto]
            );
            const idProducto = result.rows[0].id_producto;

            // Insertar multimedia si hay
            if (data.multimedia && data.multimedia.length > 0) {
                for (const m of data.multimedia) {
                    if (m.tipo === 'foto') {
                        await client.query(
                            `INSERT INTO multimedia_producto (FK_id_producto, tipo, ref_foto) VALUES ($1, $2, $3)`,
                            [idProducto, m.tipo, m.ref]
                        );
                    } else if (m.tipo === 'video') {
                        await client.query(
                            `INSERT INTO multimedia_producto (FK_id_producto, tipo, ref_video) VALUES ($1, $2, $3)`,
                            [idProducto, m.tipo, m.ref]
                        );
                    }
                }
            }
            
            await client.query('COMMIT');
            return { id_producto: idProducto };
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    static async getProductosByEstablecimiento(idEstablecimiento: number) {
        try {
            const sql = `
                SELECT 
                    p.id_producto,
                    p.nombre,
                    p.precio,
                    p.descripcion,
                    p.FK_id_establecimiento,
                    p.FK_id_categoria_producto,
                    cp.nombre as categoria_producto,
                    COALESCE(mp.multimedia_array, '[]'::json) as multimedia
                FROM producto p
                LEFT JOIN categoria_producto cp ON p.FK_id_categoria_producto = cp.id_categoria_producto
                LEFT JOIN (
                    SELECT 
                        FK_id_producto,
                        json_agg(
                            json_build_object(
                                'id_multimedia', id_multimedia_producto,
                                'tipo', tipo,
                                'ref_foto', ref_foto,
                                'ref_video', ref_video
                            )
                        ) as multimedia_array
                    FROM multimedia_producto
                    GROUP BY FK_id_producto
                ) mp ON p.id_producto = mp.FK_id_producto
                WHERE p.FK_id_establecimiento = $1
                ORDER BY p.id_producto DESC
            `;
            
            const result = await db.query(sql, [idEstablecimiento]);
            return result.rows;
        } catch (error) {
            console.error('Error al obtener productos del establecimiento:', error);
            throw error;
        }
    }

    static async getProductoById(idProducto: number, idEstablecimiento?: number) {
        try {
            let sql = `
                SELECT 
                    p.id_producto,
                    p.nombre,
                    p.precio,
                    p.descripcion,
                    p.FK_id_establecimiento,
                    p.FK_id_categoria_producto,
                    cp.nombre as categoria_producto,
                    COALESCE(mp.multimedia_array, '[]'::json) as multimedia
                FROM producto p
                LEFT JOIN categoria_producto cp ON p.FK_id_categoria_producto = cp.id_categoria_producto
                LEFT JOIN (
                    SELECT 
                        FK_id_producto,
                        json_agg(
                            json_build_object(
                                'id_multimedia', id_multimedia_producto,
                                'tipo', tipo,
                                'ref_foto', ref_foto,
                                'ref_video', ref_video
                            )
                        ) as multimedia_array
                    FROM multimedia_producto
                    GROUP BY FK_id_producto
                ) mp ON p.id_producto = mp.FK_id_producto
                WHERE p.id_producto = $1
            `;
            
            const params = [idProducto];
            if (idEstablecimiento) {
                sql += ` AND p.FK_id_establecimiento = $2`;
                params.push(idEstablecimiento);
            }
            
            const result = await db.query(sql, params);
            return result.rows[0] || null;
        } catch (error) {
            console.error('Error al obtener producto por ID:', error);
            throw error;
        }
    }

    static async editarProducto(
        idProducto: number,
        idEstablecimiento: number,
        datosActualizados: any,
        nuevaMultimedia?: { tipo: 'foto' | 'video', ref: string }[],
        multimediaAEliminar?: number[]
    ) {
        const client = await db.connect();
        try {
            await client.query('BEGIN');
            
            // Verificar que el producto pertenece al establecimiento
            const producto = await client.query(
                'SELECT 1 FROM producto WHERE id_producto = $1 AND FK_id_establecimiento = $2',
                [idProducto, idEstablecimiento]
            );
            if (producto.rowCount === 0) {
                throw new Error('Producto no encontrado o no tienes permisos');
            }
            
            // Actualizar datos básicos del producto
            if (datosActualizados.nombre || datosActualizados.precio || 
                datosActualizados.descripcion || datosActualizados.FK_id_categoria_producto) {
                
                let updateFields = [];
                let values = [];
                let paramIndex = 1;
                
                if (datosActualizados.nombre !== undefined) {
                    updateFields.push(`nombre = $${paramIndex}`);
                    values.push(datosActualizados.nombre);
                    paramIndex++;
                }
                if (datosActualizados.precio !== undefined) {
                    updateFields.push(`precio = $${paramIndex}`);
                    values.push(datosActualizados.precio);
                    paramIndex++;
                }
                if (datosActualizados.descripcion !== undefined) {
                    updateFields.push(`descripcion = $${paramIndex}`);
                    values.push(datosActualizados.descripcion);
                    paramIndex++;
                }
                if (datosActualizados.FK_id_categoria_producto !== undefined) {
                    updateFields.push(`FK_id_categoria_producto = $${paramIndex}`);
                    values.push(datosActualizados.FK_id_categoria_producto);
                    paramIndex++;
                }
                
                values.push(idProducto);
                const sqlUpdate = `
                    UPDATE producto 
                    SET ${updateFields.join(', ')}
                    WHERE id_producto = $${paramIndex}
                `;
                await client.query(sqlUpdate, values);
            }
            
            // Eliminar multimedia especificada
            if (multimediaAEliminar && multimediaAEliminar.length > 0) {
                await client.query(
                    'DELETE FROM multimedia_producto WHERE id_multimedia_producto = ANY($1) AND FK_id_producto = $2',
                    [multimediaAEliminar, idProducto]
                );
            }
            
            // Agregar nueva multimedia
            if (nuevaMultimedia && nuevaMultimedia.length > 0) {
                for (const m of nuevaMultimedia) {
                    if (m.tipo === 'foto') {
                        await client.query(
                            `INSERT INTO multimedia_producto (FK_id_producto, tipo, ref_foto) VALUES ($1, $2, $3)`,
                            [idProducto, m.tipo, m.ref]
                        );
                    } else if (m.tipo === 'video') {
                        await client.query(
                            `INSERT INTO multimedia_producto (FK_id_producto, tipo, ref_video) VALUES ($1, $2, $3)`,
                            [idProducto, m.tipo, m.ref]
                        );
                    }
                }
            }
            
            await client.query('COMMIT');
            return { id_producto: idProducto, actualizado: true };
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    static async eliminarProducto(idProducto: number, idEstablecimiento: number) {
        const client = await db.connect();
        try {
            await client.query('BEGIN');
            
            // Verificar que el producto pertenece al establecimiento
            const producto = await client.query(
                'SELECT 1 FROM producto WHERE id_producto = $1 AND FK_id_establecimiento = $2',
                [idProducto, idEstablecimiento]
            );
            if (producto.rowCount === 0) {
                throw new Error('Producto no encontrado o no tienes permisos');
            }
            
            // Eliminar el producto (la multimedia se elimina en cascada)
            await client.query('DELETE FROM producto WHERE id_producto = $1', [idProducto]);
            
            await client.query('COMMIT');
            return { id_producto: idProducto, eliminado: true };
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }
}

export default ProductoRepository; 