import { Request, Response, NextFunction } from 'express';
import { ActivityQueueService } from '../../workers/activityWorker';

// Middleware para registrar automáticamente clics en perfiles de establecimientos
export const registrarClicPerfil = (req: Request, res: Response, next: NextFunction) => {
    try {
        // Obtener ID del establecimiento de diferentes fuentes posibles
        const establecimientoId = extractEstablecimientoId(req);
        
        if (establecimientoId) {
            // Obtener ID del usuario si está autenticado (opcional)
            const usuarioId = (req as any).user?.id;
            
            // Obtener datos adicionales para el registro
            const datosAdicionales = {
                ip: req.ip || req.connection.remoteAddress,
                user_agent: req.get('User-Agent'),
                referer: req.get('Referer'),
                timestamp: new Date().toISOString(),
                endpoint: req.originalUrl,
                method: req.method
            };

            // Registrar actividad de forma asíncrona (no bloquea la response)
            ActivityQueueService.registrarActividad(
                establecimientoId,
                usuarioId,
                'click_establecimiento',
                datosAdicionales
            ).catch(error => {
                console.error('❌ Error registrando clic en perfil:', error);
                // No afecta la response del usuario
            });

            console.log(`👆 Clic registrado en establecimiento ${establecimientoId} ${usuarioId ? `por usuario ${usuarioId}` : '(anónimo)'}`);
        }
    } catch (error) {
        console.error('❌ Error en middleware de clic perfil:', error);
        // No afecta la response, continúa normalmente
    }
    
    next();
};

// Middleware para registrar cuando se añade un comentario
export const registrarComentario = (req: Request, res: Response, next: NextFunction) => {
    try {
        const establecimientoId = extractEstablecimientoId(req);
        const usuarioId = (req as any).user?.id;
        
        if (establecimientoId && usuarioId) {
            const datosAdicionales = {
                comentario_texto: req.body.cuerpo_comentario?.substring(0, 100), // Primeros 100 caracteres
                ip: req.ip || req.connection.remoteAddress,
                timestamp: new Date().toISOString()
            };

            ActivityQueueService.registrarActividad(
                establecimientoId,
                usuarioId,
                'comentario',
                datosAdicionales
            ).catch(error => {
                console.error('❌ Error registrando comentario:', error);
            });

            console.log(`💬 Comentario registrado para establecimiento ${establecimientoId} por usuario ${usuarioId}`);
        }
    } catch (error) {
        console.error('❌ Error en middleware de comentario:', error);
    }
    
    next();
};

// Middleware para registrar cuando se añade/modifica una puntuación
export const registrarPuntuacion = (req: Request, res: Response, next: NextFunction) => {
    try {
        const establecimientoId = extractEstablecimientoId(req);
        const usuarioId = (req as any).user?.id;
        
        if (establecimientoId && usuarioId) {
            const datosAdicionales = {
                valor_puntuacion: req.body.valor_puntuado,
                ip: req.ip || req.connection.remoteAddress,
                timestamp: new Date().toISOString()
            };

            ActivityQueueService.registrarActividad(
                establecimientoId,
                usuarioId,
                'puntuacion',
                datosAdicionales
            ).catch(error => {
                console.error('❌ Error registrando puntuación:', error);
            });

            console.log(`⭐ Puntuación registrada para establecimiento ${establecimientoId} por usuario ${usuarioId}`);
        }
    } catch (error) {
        console.error('❌ Error en middleware de puntuación:', error);
    }
    
    next();
};

// Middleware para registrar cuando se añade a favoritos
export const registrarFavorito = (req: Request, res: Response, next: NextFunction) => {
    try {
        const establecimientoId = extractEstablecimientoId(req);
        const usuarioId = (req as any).user?.id;
        
        if (establecimientoId && usuarioId) {
            const datosAdicionales = {
                accion: req.method === 'POST' ? 'añadir' : 'remover',
                ip: req.ip || req.connection.remoteAddress,
                timestamp: new Date().toISOString()
            };

            ActivityQueueService.registrarActividad(
                establecimientoId,
                usuarioId,
                'favorito',
                datosAdicionales
            ).catch(error => {
                console.error('❌ Error registrando favorito:', error);
            });

            console.log(`❤️ Favorito registrado para establecimiento ${establecimientoId} por usuario ${usuarioId}`);
        }
    } catch (error) {
        console.error('❌ Error en middleware de favorito:', error);
    }
    
    next();
};

// Middleware para registrar búsquedas que mencionan un establecimiento
export const registrarBusqueda = (establecimientoId: number) => {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            const usuarioId = (req as any).user?.id;
            
            const datosAdicionales = {
                termino_busqueda: req.query.q || req.query.search || req.body.termino,
                ip: req.ip || req.connection.remoteAddress,
                timestamp: new Date().toISOString(),
                endpoint: req.originalUrl
            };

            ActivityQueueService.registrarActividad(
                establecimientoId,
                usuarioId,
                'busqueda',
                datosAdicionales
            ).catch(error => {
                console.error('❌ Error registrando búsqueda:', error);
            });

            console.log(`🔍 Búsqueda registrada para establecimiento ${establecimientoId}`);
        } catch (error) {
            console.error('❌ Error en middleware de búsqueda:', error);
        }
        
        next();
    };
};

// Función auxiliar para extraer el ID del establecimiento de diferentes fuentes
function extractEstablecimientoId(req: Request): number | null {
    // Intentar obtener de diferentes lugares según la ruta
    const sources = [
        req.params.id,
        req.params.establecimientoId,
        req.params.idEstablecimiento,
        req.body.fk_id_establecimiento,
        req.body.FK_id_establecimiento,
        req.body.establecimiento_id,
        req.query.establecimiento_id
    ];

    for (const source of sources) {
        if (source) {
            const id = parseInt(source as string);
            if (!isNaN(id) && id > 0) {
                return id;
            }
        }
    }

    return null;
}

// Middleware específico para rutas de establecimientos
export const trackEstablecimientoAccess = (req: Request, res: Response, next: NextFunction) => {
    // Solo registrar en rutas GET (ver detalles, no modificaciones)
    if (req.method === 'GET') {
        registrarClicPerfil(req, res, next);
    } else {
        next();
    }
};

// Middleware para registrar actividad basada en el tipo de acción
export const registrarActividadPorTipo = (tipoActividad: string) => {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            const establecimientoId = extractEstablecimientoId(req);
            const usuarioId = (req as any).user?.id;
            
            if (establecimientoId) {
                const datosAdicionales = {
                    ip: req.ip || req.connection.remoteAddress,
                    user_agent: req.get('User-Agent'),
                    timestamp: new Date().toISOString(),
                    endpoint: req.originalUrl,
                    method: req.method,
                    body_keys: Object.keys(req.body || {})
                };

                ActivityQueueService.registrarActividad(
                    establecimientoId,
                    usuarioId,
                    tipoActividad,
                    datosAdicionales
                ).catch(error => {
                    console.error(`❌ Error registrando actividad ${tipoActividad}:`, error);
                });

                console.log(`📊 Actividad ${tipoActividad} registrada para establecimiento ${establecimientoId}`);
            }
        } catch (error) {
            console.error(`❌ Error en middleware de actividad ${tipoActividad}:`, error);
        }
        
        next();
    };
};

// Función para registrar actividad manualmente desde otros servicios
export const registrarActividadManual = async (
    establecimientoId: number,
    usuarioId: number | undefined,
    tipoActividad: string,
    datosAdicionales?: any
): Promise<void> => {
    try {
        await ActivityQueueService.registrarActividad(
            establecimientoId,
            usuarioId,
            tipoActividad,
            datosAdicionales
        );
        
        console.log(`✅ Actividad manual ${tipoActividad} registrada para establecimiento ${establecimientoId}`);
    } catch (error) {
        console.error('❌ Error en registro manual de actividad:', error);
        throw error;
    }
}; 