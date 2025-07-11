import db from '../../config/config-db';
import { EstablecimientoDto } from '../../Dto/EstablecimientoDto/establecimientoDto';
import { MultimediaEstablecimientoDto } from '../../Dto/EstablecimientoDto/multimediaEstablecimientoDto';
import { DocumentacionDto } from '../../Dto/EstablecimientoDto/documentacionDto';
import { EstadoMembresiaDto } from '../../Dto/EstablecimientoDto/estadoMembresiaDto';
import { sendEmailAzure, getAprobacionEstablecimientoTemplate, getRechazoEstablecimientoTemplate } from '../../Helpers/Azure/EmailHelper';
import { EstadoEstablecimientoUsuarioDto } from '../../Dto/EstablecimientoDto/estadoEstablecimientoUsuarioDto';

class EstablecimientoRepository {
    static async add(
        establecimiento: EstablecimientoDto,
        multimedia: MultimediaEstablecimientoDto | null,
        documentacion: DocumentacionDto | null,
        estadoMembresia: EstadoMembresiaDto,
        horarios?: any[]
    ) {
        const client = await db.connect();
        
        try {
            await client.query('BEGIN');

            // Insertar establecimiento con estado por defecto 'Pendiente'
            const sqlEstablecimiento = `
                INSERT INTO establecimiento (
                    nombre_establecimiento, 
                    ubicacion, 
                    telefono, 
                    contacto,
                    descripcion, 
                    FK_id_categoria_estab,
                    estado,
                    FK_id_usuario
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
                RETURNING id_establecimiento
            `;
            
        const valuesEstablecimiento = [
            establecimiento.nombre,
            establecimiento.ubicacion,
            establecimiento.telefono,
            establecimiento.contacto,
            establecimiento.descripcion,
            establecimiento.FK_id_categoria_estab,
            'Pendiente',
            establecimiento.FK_id_usuario
        ];
            
            const result = await client.query(sqlEstablecimiento, valuesEstablecimiento);
        const idEstablecimiento = result.rows[0].id_establecimiento;

            // Insertar estado de membresía
            const sqlMembresia = `
                INSERT INTO estado_membresia (FK_id_establecimiento, estado) 
                VALUES ($1, $2)
            `;
            await client.query(sqlMembresia, [idEstablecimiento, estadoMembresia.estado]);

            // Insertar multimedia si se proporciona
            if (multimedia && multimedia.multimedia.length > 0) {
                const sqlMultimedia = `
                    INSERT INTO multimedia_establecimiento (FK_id_establecimiento, multimedia)
                    VALUES ($1, $2)
                `;
        for (const item of multimedia.multimedia) {
                    await client.query(sqlMultimedia, [idEstablecimiento, item]);
                }
        }

            // Insertar documentación si se proporciona
            if (documentacion) {
                const sqlDocumentacion = `
                    INSERT INTO documentacion_establecimiento (
                        FK_id_establecimiento, 
                        registro_mercantil, 
                        rut, 
                        certificado_salud, 
                        registro_invima
                    ) VALUES ($1, $2, $3, $4, $5)
                `;
                await client.query(sqlDocumentacion, [
            idEstablecimiento,
            documentacion.registro_mercantil,
            documentacion.rut,
            documentacion.certificado_salud,
            documentacion.registro_invima
        ]);
            }

            // Insertar horarios si se proporcionan
            if (horarios && horarios.length > 0) {
                const sqlHorario = `
                    INSERT INTO horario_establecimiento (
                        id_establecimiento, 
                        dia_semana, 
                        hora_apertura, 
                        hora_cierre
                    ) VALUES ($1, $2, $3, $4)
                `;
                for (const horario of horarios) {
                    await client.query(sqlHorario, [
                        idEstablecimiento,
                        horario.dia_semana,
                        horario.hora_apertura,
                        horario.hora_cierre
                    ]);
                }
            }

            await client.query('COMMIT');
            return { id_establecimiento: idEstablecimiento };

        } catch (error) {
            await client.query('ROLLBACK');
            console.error('Error en el repositorio al registrar establecimiento:', error);
            throw error;
        } finally {
            client.release();
        }
    }

    static async aprobarEstablecimiento(id: number, motivo?: string) {
        const client = await db.connect();
        try {
            await client.query('BEGIN');
            // Cambiar estado y obtener usuario y nombre establecimiento
            const result = await client.query(
                `UPDATE establecimiento SET estado = 'Aprobado' WHERE id_establecimiento = $1 AND estado = 'Pendiente' RETURNING FK_id_usuario, nombre_establecimiento`,
                [id]
            );
            if (result.rowCount === 0) throw new Error('Establecimiento no encontrado o ya no está pendiente');
            const { fk_id_usuario, nombre_establecimiento } = result.rows[0];
            // Obtener email y nombre del usuario
            const userResult = await client.query('SELECT email, nombre FROM usuario_general WHERE id_usuario = $1', [fk_id_usuario]);
            const { email, nombre } = userResult.rows[0];
            // Insertar en propietario_establecimiento si no está
            const existe = await client.query('SELECT 1 FROM propietario_establecimiento WHERE id_propietario = $1', [fk_id_usuario]);
            if (existe.rowCount === 0) {
                await client.query('INSERT INTO propietario_establecimiento (id_propietario) VALUES ($1)', [fk_id_usuario]);
            }
            // Enviar correo de aprobación
            const html = getAprobacionEstablecimientoTemplate(nombre, nombre_establecimiento);
            await sendEmailAzure(email, '¡Tu establecimiento ha sido aprobado en QuindiFood!', html);
            await client.query('COMMIT');
            return { id_establecimiento: id, estado: 'Aprobado' };
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    static async rechazarEstablecimiento(id: number, motivo: string) {
        const client = await db.connect();
        try {
            await client.query('BEGIN');
            // Cambiar estado y obtener usuario y nombre establecimiento
            const result = await client.query(
                `UPDATE establecimiento SET estado = 'Rechazado' WHERE id_establecimiento = $1 AND estado = 'Pendiente' RETURNING FK_id_usuario, nombre_establecimiento`,
                [id]
            );
            if (result.rowCount === 0) throw new Error('Establecimiento no encontrado o ya no está pendiente');
            const { fk_id_usuario, nombre_establecimiento } = result.rows[0];
            // Obtener email y nombre del usuario
            const userResult = await client.query('SELECT email, nombre FROM usuario_general WHERE id_usuario = $1', [fk_id_usuario]);
            const { email, nombre } = userResult.rows[0];
            // Enviar correo de rechazo
            const html = getRechazoEstablecimientoTemplate(nombre, nombre_establecimiento, motivo);
            await sendEmailAzure(email, 'Tu establecimiento fue rechazado en QuindiFood', html);
            await client.query('COMMIT');
            return { id_establecimiento: id, estado: 'Rechazado', motivo };
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    static async getSolicitudesPendientes() {
        try {
            const sql = `
                SELECT 
                    e.id_establecimiento,
                    e.nombre_establecimiento,
                    e.descripcion,
                    e.ubicacion,
                    e.telefono,
                    e.contacto,
                    e.estado,
                    e.created_at,
                    c.nombre as categoria,
                    COALESCE(ia.imagenes_array, '[]'::json) as imagenes,
                    COALESCE(doc.documentacion, '{}'::json) as documentacion,
                    COALESCE(h.horarios_array, '[]'::json) as horarios
                FROM establecimiento e
                LEFT JOIN categoria_establecimiento c ON e.FK_id_categoria_estab = c.id_categoria_establecimiento
                LEFT JOIN (
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
                ) ia ON e.id_establecimiento = ia.FK_id_establecimiento
                LEFT JOIN (
                    SELECT 
                        FK_id_establecimiento,
                        json_build_object(
                            'registro_mercantil', registro_mercantil,
                            'rut', rut,
                            'certificado_salud', certificado_salud,
                            'registro_invima', registro_invima
                        ) as documentacion
                    FROM documentacion_establecimiento
                ) doc ON e.id_establecimiento = doc.FK_id_establecimiento
                LEFT JOIN (
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
                ) h ON e.id_establecimiento = h.id_establecimiento
                WHERE e.estado = 'Pendiente'
            `;
            
            const result = await db.query(sql);
            return result.rows;

        } catch (error) {
            console.error('Error al obtener solicitudes pendientes:', error);
            throw error;
        }
    }

    static async suspenderEstablecimiento(id: number) {
        const client = await db.connect();
        try {
            await client.query('BEGIN');
            // Cambiar estado del establecimiento a 'Suspendido' y obtener el usuario propietario
            const result = await client.query(
                `UPDATE establecimiento SET estado = 'Suspendido' WHERE id_establecimiento = $1 RETURNING FK_id_usuario`,
                [id]
            );
            if (result.rowCount === 0) throw new Error('Establecimiento no encontrado');
            const { fk_id_usuario } = result.rows[0];
            // Cambiar estado del usuario propietario a 'Inactivo'
            await client.query(
                `UPDATE usuario_general SET estado = 'Inactivo' WHERE id_usuario = $1`,
                [fk_id_usuario]
            );
            await client.query('COMMIT');
            return { id_establecimiento: id, estado: 'Suspendido', id_usuario: fk_id_usuario };
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    static async eliminarEstablecimientoCompleto(idEstablecimiento: number, idUsuario?: number, isAdmin = false) {
        const client = await db.connect();
        try {
            await client.query('BEGIN');
            // Validar si el usuario es propietario del establecimiento (si no es admin)
            if (!isAdmin) {
                const valid = await client.query(
                    'SELECT 1 FROM establecimiento WHERE id_establecimiento = $1 AND FK_id_usuario = $2',
                    [idEstablecimiento, idUsuario]
                );
                if (valid.rowCount === 0) throw new Error('No tienes permisos para eliminar este establecimiento');
            }
            // Obtener el propietario
            const result = await client.query(
                'SELECT FK_id_usuario FROM establecimiento WHERE id_establecimiento = $1',
                [idEstablecimiento]
            );
            if (result.rowCount === 0) throw new Error('Establecimiento no encontrado');
            const fk_id_usuario = result.rows[0].fk_id_usuario;

            // Eliminar el establecimiento (esto elimina en cascada toda la info relacionada)
            await client.query('DELETE FROM establecimiento WHERE id_establecimiento = $1', [idEstablecimiento]);

            // Verificar si el usuario tiene más establecimientos
            const restantes = await client.query(
                'SELECT 1 FROM establecimiento WHERE FK_id_usuario = $1',
                [fk_id_usuario]
            );
            if (restantes.rowCount === 0) {
                // Eliminar de propietario_establecimiento si existe
                await client.query('DELETE FROM propietario_establecimiento WHERE id_propietario = $1', [fk_id_usuario]);
                // Insertar en cliente si no existe
                await client.query(
                    'INSERT INTO cliente (id_cliente) SELECT $1 WHERE NOT EXISTS (SELECT 1 FROM cliente WHERE id_cliente = $1)',
                    [fk_id_usuario]
                );
            }
            await client.query('COMMIT');
            return { id_establecimiento: idEstablecimiento, eliminado: true };
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    static async getMiEstablecimiento(idUsuario: number) {
        try {
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
                    e.created_at,
                    c.nombre as categoria,
                    COALESCE(ia.imagenes_array, '[]'::json) as imagenes,
                    COALESCE(doc.documentacion, '{}'::json) as documentacion,
                    COALESCE(h.horarios_array, '[]'::json) as horarios,
                    em.estado as estado_membresia,
                    em.fecha_pago,
                    docu.registro_mercantil,
                    docu.rut,
                    docu.certificado_salud,
                    docu.registro_invima
                FROM establecimiento e
                INNER JOIN propietario_establecimiento pe ON e.FK_id_usuario = pe.id_propietario
                LEFT JOIN categoria_establecimiento c ON e.FK_id_categoria_estab = c.id_categoria_establecimiento
                LEFT JOIN (
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
                ) ia ON e.id_establecimiento = ia.FK_id_establecimiento
                LEFT JOIN (
                    SELECT 
                        FK_id_establecimiento,
                        json_build_object(
                            'registro_mercantil', registro_mercantil,
                            'rut', rut,
                            'certificado_salud', certificado_salud,
                            'registro_invima', registro_invima
                        ) as documentacion
                    FROM documentacion_establecimiento
                ) doc ON e.id_establecimiento = doc.FK_id_establecimiento
                LEFT JOIN documentacion_establecimiento docu ON e.id_establecimiento = docu.FK_id_establecimiento
                LEFT JOIN (
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
                ) h ON e.id_establecimiento = h.id_establecimiento
                LEFT JOIN estado_membresia em ON e.id_establecimiento = em.FK_id_establecimiento
                WHERE pe.id_propietario = $1
            `;
            
            const result = await db.query(sql, [idUsuario]);
            return result.rows[0] || null;
        } catch (error) {
            console.error('Error al obtener mi establecimiento:', error);
            throw error;
        }
    }

    static async editarEstablecimiento(
        idEstablecimiento: number, 
        datosActualizados: any, 
        nuevasFotos?: string[], 
        fotosAEliminar?: number[],
        nuevaDocumentacion?: any
    ) {
        const client = await db.connect();
        try {
            await client.query('BEGIN');
            
            // Actualizar datos básicos del establecimiento
            if (datosActualizados.nombre_establecimiento || datosActualizados.descripcion || 
                datosActualizados.ubicacion || datosActualizados.telefono || 
                datosActualizados.contacto || datosActualizados.FK_id_categoria_estab) {
                
                let updateFields = [];
                let values = [];
                let paramIndex = 1;
                
                if (datosActualizados.nombre_establecimiento) {
                    updateFields.push(`nombre_establecimiento = $${paramIndex}`);
                    values.push(datosActualizados.nombre_establecimiento);
                    paramIndex++;
                }
                if (datosActualizados.descripcion) {
                    updateFields.push(`descripcion = $${paramIndex}`);
                    values.push(datosActualizados.descripcion);
                    paramIndex++;
                }
                if (datosActualizados.ubicacion) {
                    updateFields.push(`ubicacion = $${paramIndex}`);
                    values.push(datosActualizados.ubicacion);
                    paramIndex++;
                }
                if (datosActualizados.telefono) {
                    updateFields.push(`telefono = $${paramIndex}`);
                    values.push(datosActualizados.telefono);
                    paramIndex++;
                }
                if (datosActualizados.contacto) {
                    updateFields.push(`contacto = $${paramIndex}`);
                    values.push(datosActualizados.contacto);
                    paramIndex++;
                }
                if (datosActualizados.FK_id_categoria_estab) {
                    updateFields.push(`FK_id_categoria_estab = $${paramIndex}`);
                    values.push(datosActualizados.FK_id_categoria_estab);
                    paramIndex++;
                }
                
                values.push(idEstablecimiento);
                const sqlUpdate = `
                    UPDATE establecimiento 
                    SET ${updateFields.join(', ')}
                    WHERE id_establecimiento = $${paramIndex}
                `;
                await client.query(sqlUpdate, values);
            }
            
            // Actualizar documentación legal si se proporciona
            if (nuevaDocumentacion) {
                const docFields = [];
                const docValues = [];
                let docParamIndex = 1;
                
                if (nuevaDocumentacion.registro_mercantil !== undefined) {
                    docFields.push(`registro_mercantil = $${docParamIndex}`);
                    docValues.push(nuevaDocumentacion.registro_mercantil);
                    docParamIndex++;
                }
                if (nuevaDocumentacion.rut !== undefined) {
                    docFields.push(`rut = $${docParamIndex}`);
                    docValues.push(nuevaDocumentacion.rut);
                    docParamIndex++;
                }
                if (nuevaDocumentacion.certificado_salud !== undefined) {
                    docFields.push(`certificado_salud = $${docParamIndex}`);
                    docValues.push(nuevaDocumentacion.certificado_salud);
                    docParamIndex++;
                }
                if (nuevaDocumentacion.registro_invima !== undefined) {
                    docFields.push(`registro_invima = $${docParamIndex}`);
                    docValues.push(nuevaDocumentacion.registro_invima);
                    docParamIndex++;
                }
                
                if (docFields.length > 0) {
                    docValues.push(idEstablecimiento);
                    const sqlDocUpdate = `
                        UPDATE documentacion_establecimiento 
                        SET ${docFields.join(', ')}
                        WHERE FK_id_establecimiento = $${docParamIndex}
                    `;
                    await client.query(sqlDocUpdate, docValues);
                }
            }
            
            // Eliminar fotos especificadas
            if (fotosAEliminar && fotosAEliminar.length > 0) {
                await client.query(
                    'DELETE FROM multimedia_establecimiento WHERE id_multimedia_estab = ANY($1) AND FK_id_establecimiento = $2',
                    [fotosAEliminar, idEstablecimiento]
                );
            }
            
            // Agregar nuevas fotos
            if (nuevasFotos && nuevasFotos.length > 0) {
                for (const foto of nuevasFotos) {
                    await client.query(
                        'INSERT INTO multimedia_establecimiento (FK_id_establecimiento, multimedia) VALUES ($1, $2)',
                        [idEstablecimiento, foto]
                    );
                }
            }
            
            // Actualizar horarios si se proporcionan
            if (datosActualizados.horarios && Array.isArray(datosActualizados.horarios)) {
                // Eliminar horarios existentes
                await client.query('DELETE FROM horario_establecimiento WHERE id_establecimiento = $1', [idEstablecimiento]);
                
                // Insertar nuevos horarios
                for (const horario of datosActualizados.horarios) {
                    await client.query(
                        'INSERT INTO horario_establecimiento (id_establecimiento, dia_semana, hora_apertura, hora_cierre) VALUES ($1, $2, $3, $4)',
                        [idEstablecimiento, horario.dia, horario.hora_apertura, horario.hora_cierre]
                    );
                }
            }
            
            await client.query('COMMIT');
            return { id_establecimiento: idEstablecimiento, actualizado: true };
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    static async getEstadoEstablecimientoUsuario(idUsuario: number): Promise<EstadoEstablecimientoUsuarioDto> {
        try {
            const sql = `
                SELECT 
                    e.id_establecimiento,
                    e.nombre_establecimiento,
                    e.estado as estado_establecimiento,
                    e.created_at as fecha_creacion,
                    COALESCE(em.estado, 'Inactivo') as estado_membresia
                FROM establecimiento e
                LEFT JOIN estado_membresia em ON e.id_establecimiento = em.FK_id_establecimiento
                WHERE e.FK_id_usuario = $1
                ORDER BY e.created_at DESC
                LIMIT 1
            `;
            
            const result = await db.query(sql, [idUsuario]);
            
            if (result.rowCount === 0) {
                // El usuario no tiene establecimiento
                return new EstadoEstablecimientoUsuarioDto(false);
            }
            
            const establecimiento = result.rows[0];
            
            return new EstadoEstablecimientoUsuarioDto(
                true,
                establecimiento.id_establecimiento,
                establecimiento.nombre_establecimiento,
                establecimiento.estado_establecimiento,
                establecimiento.estado_membresia,
                establecimiento.fecha_creacion
            );
            
        } catch (error) {
            console.error('Error al obtener estado de establecimiento del usuario:', error);
            throw error;
        }
    }

    static async activarMembresiaPorPreapproval(preapprovalId: string) {
        const client = await db.connect();
        try {
            await client.query('BEGIN');
            // Buscar el establecimiento por preapproval_id
            const result = await client.query(
                `SELECT id_establecimiento FROM establecimiento WHERE preapproval_id = $1`,
                [preapprovalId]
            );
            if (result.rowCount === 0) throw new Error('No se encontró establecimiento con ese preapproval_id');
            const idEstablecimiento = result.rows[0].id_establecimiento;
            // Actualizar la membresía a 'Activo'
            await client.query(
                `UPDATE estado_membresia SET estado = 'Activo' WHERE FK_id_establecimiento = $1`,
                [idEstablecimiento]
            );
            await client.query('COMMIT');
            return { id_establecimiento: idEstablecimiento, estado_membresia: 'Activo' };
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    static async activarMembresiaPorPago(idEstablecimiento: number, paymentId: string) {
        const client = await db.connect();
        try {
            await client.query('BEGIN');
            
            // Actualizar la membresía a 'Activo'
            const result = await client.query(
                `UPDATE estado_membresia SET estado = 'Activo' WHERE FK_id_establecimiento = $1 RETURNING id_estado_membresia`,
                [idEstablecimiento]
            );
            
            if (result.rowCount === 0) {
                throw new Error('No se encontró establecimiento para activar membresía');
            }
            
            await client.query('COMMIT');
            
            console.log(`✅ Membresía activada para establecimiento ${idEstablecimiento} con payment ${paymentId}`);
            
            return { 
                id_establecimiento: idEstablecimiento, 
                estado_membresia: 'Activo',
                payment_id: paymentId
            };
        } catch (error) {
            await client.query('ROLLBACK');
            console.error('Error activando membresía por pago:', error);
            throw error;
        } finally {
            client.release();
        }
    }

    static async verificarEstadoMembresia(idEstablecimiento: number): Promise<string> {
        const client = await db.connect();
        try {
            const result = await client.query(
                `SELECT estado FROM estado_membresia WHERE FK_id_establecimiento = $1`,
                [idEstablecimiento]
            );
            
            if (result.rowCount === 0) {
                throw new Error('No se encontró estado de membresía para el establecimiento');
            }
            
            return result.rows[0].estado;
        } catch (error) {
            console.error('Error verificando estado de membresía:', error);
            throw error;
        } finally {
            client.release();
        }
    }

    static async verificarEstablecimientoPorUsuario(idUsuario: number): Promise<any> {
        const client = await db.connect();
        try {
            const result = await client.query(
                `SELECT e.id_establecimiento, e.nombre_establecimiento, e.estado, em.estado as estado_membresia 
                 FROM establecimiento e 
                 LEFT JOIN estado_membresia em ON e.id_establecimiento = em.FK_id_establecimiento 
                 WHERE e.FK_id_usuario = $1 
                 ORDER BY e.created_at DESC 
                 LIMIT 1`,
                [idUsuario]
            );
            
            if (result.rowCount === 0) {
                return null; // No tiene establecimientos
            }
            
            return result.rows[0];
        } catch (error) {
            console.error('Error verificando establecimiento por usuario:', error);
            throw error;
        } finally {
            client.release();
        }
    }

    static async asociarPreapprovalId(idEstablecimiento: number, preapprovalId: string) {
        await db.query(
            'UPDATE establecimiento SET preapproval_id = $1 WHERE id_establecimiento = $2',
            [preapprovalId, idEstablecimiento]
        );
        return { id_establecimiento: idEstablecimiento, preapproval_id: preapprovalId };
    }

    static async obtenerPorUsuario(idUsuario: number) {
        try {
            const sql = `
                SELECT 
                    e.id_establecimiento,
                    e.nombre_establecimiento,
                    e.estado,
                    e.FK_id_usuario,
                    em.estado as estado_membresia,
                    em.id_estado_membresia,
                    e.preapproval_id
                FROM establecimiento e
                LEFT JOIN estado_membresia em ON e.id_establecimiento = em.FK_id_establecimiento
                WHERE e.FK_id_usuario = $1
            `;
            
            const result = await db.query(sql, [idUsuario]);
            return result.rows[0] || null;
        } catch (error) {
            console.error('Error al obtener establecimiento por usuario:', error);
            throw error;
        }
    }

    static async obtenerEstablecimientoCompleto(idEstablecimiento: number) {
        try {
            const sql = `
                SELECT 
                    e.id_establecimiento,
                    e.nombre_establecimiento,
                    e.estado,
                    e.FK_id_usuario,
                    em.estado as estado_membresia,
                    em.id_estado_membresia,
                    e.preapproval_id,
                    COALESCE(h.horarios_array, '[]'::json) as horarios
                FROM establecimiento e
                LEFT JOIN estado_membresia em ON e.id_establecimiento = em.FK_id_establecimiento
                LEFT JOIN (
                    SELECT 
                        id_establecimiento,
                        json_agg(
                            json_build_object(
                                'dia_semana', dia_semana,
                                'hora_apertura', hora_apertura,
                                'hora_cierre', hora_cierre
                            )
                        ) as horarios_array
                    FROM horario_establecimiento
                    GROUP BY id_establecimiento
                ) h ON e.id_establecimiento = h.id_establecimiento
                WHERE e.id_establecimiento = $1
            `;
            
            const result = await db.query(sql, [idEstablecimiento]);
            return result.rows[0] || null;
        } catch (error) {
            console.error('Error al obtener establecimiento completo:', error);
            throw error;
        }
    }

    static async actualizarEstadoMembresia(idEstablecimiento: number, nuevoEstado: string) {
        const client = await db.connect();
        try {
            await client.query('BEGIN');
            
            // Actualizar estado_membresia
            const result = await client.query(
                `UPDATE estado_membresia 
                 SET estado = $1 
                 WHERE FK_id_establecimiento = $2 
                 RETURNING id_estado_membresia`,
                [nuevoEstado, idEstablecimiento]
            );
            
            if (result.rowCount === 0) {
                throw new Error('No se encontró registro de membresía para el establecimiento');
            }
            
            const id_estado_membresia = result.rows[0].id_estado_membresia;
            
            // Si se cancela la suscripción (Inactivo), limpiar preapproval_id
            if (nuevoEstado === 'Inactivo') {
                await client.query(
                    `UPDATE establecimiento 
                     SET preapproval_id = NULL 
                     WHERE id_establecimiento = $1`,
                    [idEstablecimiento]
                );
            }
            
            await client.query('COMMIT');
            
            return {
                success: true,
                estado_membresia: nuevoEstado,
                id_estado_membresia: id_estado_membresia
            };
            
        } catch (error) {
            await client.query('ROLLBACK');
            console.error('Error al actualizar estado de membresía:', error);
            throw error;
        } finally {
            client.release();
        }
    }

    static async cancelarRegistroPendiente(idUsuario: number) {
        try {
            // Buscar establecimiento más reciente con estado "Pendiente de Pago"
            const query = `
                SELECT e.id_establecimiento, e.nombre_establecimiento 
                FROM establecimiento e
                INNER JOIN estado_membresia em ON e.id_establecimiento = em.FK_id_establecimiento
                WHERE e.FK_id_usuario = $1 AND em.estado = 'Pendiente de Pago'
                ORDER BY e.id_establecimiento DESC
                LIMIT 1
            `;
            
            const result = await db.query(query, [idUsuario]);
            
            if (result.rows.length === 0) {
                return { success: false, message: 'No hay registro pendiente' };
            }
            
            const establecimiento = result.rows[0];
            
            // Eliminar completamente usando el método existente
            await this.eliminarEstablecimientoCompleto(establecimiento.id_establecimiento, idUsuario, false);
            
            return {
                success: true,
                data: {
                    nombre_establecimiento: establecimiento.nombre_establecimiento,
                    archivos_eliminados: 1
                }
            };
        } catch (error) {
            console.error('Error cancelando registro pendiente:', error);
            throw error;
        }
    }
}

export default EstablecimientoRepository; 