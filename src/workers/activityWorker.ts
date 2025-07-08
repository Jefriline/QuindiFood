import redisClient from '../config/redis-config';
import db from '../config/config-db';

// Tipos de trabajos que puede procesar el worker
export interface ActivityJob {
    type: 'registrar_actividad' | 'limpiar_actividad_antigua' | 'calcular_estadisticas';
    data: any;
    timestamp: number;
    id: string;
}

export class ActivityWorker {
    private isRunning = false;
    private readonly QUEUE_NAME = 'activity_queue';
    
    constructor() {
        this.setupGracefulShutdown();
    }

    // Iniciar el worker
    async start() {
        if (this.isRunning) {
            console.log('🔄 Worker ya está ejecutándose');
            return;
        }

        try {
            // Verificar si Redis ya está conectado antes de intentar conectar
            if (!redisClient.isOpen) {
                await redisClient.connect();
            }
            this.isRunning = true;
            console.log('🚀 Activity Worker iniciado exitosamente');
            
            // Procesar trabajos de forma continua
            this.processJobs();
        } catch (error: any) {
            console.error('❌ Error iniciando Activity Worker:', error);
            // Si ya está conectado, continuar sin error
            if (error.message && error.message.includes('Socket already opened')) {
                this.isRunning = true;
                console.log('🚀 Activity Worker iniciado (Redis ya conectado)');
                this.processJobs();
            } else {
                throw error;
            }
        }
    }

    // Procesar trabajos de la cola (simplificado)
    private async processJobs() {
        while (this.isRunning) {
            try {
                // Usar un polling simple en lugar de BRPOP para evitar problemas de compatibilidad
                let jobData;
                try {
                    // Intentar diferentes métodos según la versión de Redis
                    if (typeof redisClient.lPop === 'function') {
                        jobData = await redisClient.lPop(this.QUEUE_NAME);
                    } else if (typeof redisClient.lpop === 'function') {
                        jobData = await redisClient.lpop(this.QUEUE_NAME);
                    } else {
                        // Fallback: usar BRPOP con timeout
                        const result = await redisClient.bRPop(this.QUEUE_NAME, 1);
                        jobData = result && Array.isArray(result) ? result[1] : null;
                    }
                } catch (error) {
                    console.error('❌ Error obteniendo trabajo de Redis:', error);
                    jobData = null;
                }

                if (jobData && typeof jobData === 'string') {
                    const job: ActivityJob = JSON.parse(jobData);
                    await this.processJob(job);
                } else {
                    // Si no hay trabajos, esperar un poco
                    await this.sleep(1000);
                }
            } catch (error) {
                console.error('❌ Error procesando trabajos:', error);
                await this.sleep(2000);
            }
        }
    }

    // Procesar un trabajo individual
    private async processJob(job: ActivityJob) {
        console.log(`📋 Procesando trabajo: ${job.type} - ${job.id}`);
        
        try {
            switch (job.type) {
                case 'registrar_actividad':
                    await this.registrarActividad(job.data);
                    break;
                case 'limpiar_actividad_antigua':
                    await this.limpiarActividadAntigua();
                    break;
                case 'calcular_estadisticas':
                    await this.calcularEstadisticas(job.data);
                    break;
                default:
                    console.warn(`⚠️ Tipo de trabajo desconocido: ${job.type}`);
            }
            
            console.log(`✅ Trabajo completado: ${job.type} - ${job.id}`);
        } catch (error) {
            console.error(`❌ Error procesando trabajo ${job.id}:`, error);
        }
    }

    // Registrar actividad en la base de datos
    private async registrarActividad(data: {
        fk_id_establecimiento: number;
        fk_id_usuario?: number;
        tipo_actividad: string;
        datos_adicionales?: any;
    }) {
        try {
            const client = await db.connect();
            
            try {
                const query = `
                    INSERT INTO actividad_establecimiento 
                    (fk_id_establecimiento, fk_id_usuario, tipo_actividad, datos_adicionales)
                    VALUES ($1, $2, $3, $4)
                `;
                
                await client.query(query, [
                    data.fk_id_establecimiento,
                    data.fk_id_usuario || null,
                    data.tipo_actividad,
                    data.datos_adicionales ? JSON.stringify(data.datos_adicionales) : null
                ]);
            } finally {
                client.release();
            }
        } catch (error) {
            console.error('❌ Error registrando actividad:', error);
            // No lanzamos el error para que el worker continúe funcionando
        }
    }

    // Limpiar actividad antigua (más de 3 meses)
    private async limpiarActividadAntigua() {
        try {
            // Verificar conexión antes de ejecutar
            const client = await db.connect();
            
            try {
                const result = await client.query(`
                    DELETE FROM actividad_establecimiento 
                    WHERE fecha_actividad < NOW() - INTERVAL '3 months'
                    AND tipo_actividad != 'limpieza_automatica'
                `);
                
                console.log(`🧹 Limpieza completada: ${result.rowCount} registros eliminados`);
                
                // Registrar la limpieza (sin foreign key para logs del sistema)
                try {
                    const query = `
                        INSERT INTO actividad_establecimiento 
                        (fk_id_establecimiento, fk_id_usuario, tipo_actividad, datos_adicionales)
                        VALUES (NULL, NULL, $1, $2)
                    `;
                    
                    await client.query(query, [
                        'limpieza_automatica',
                        JSON.stringify({
                            registros_eliminados: result.rowCount,
                            fecha_limpieza: new Date().toISOString()
                        })
                    ]);
                } catch (error) {
                    console.error('❌ Error registrando limpieza automática:', error);
                    // No lanzamos el error para no interrumpir el proceso
                }
            } finally {
                client.release();
            }
        } catch (error) {
            console.error('❌ Error en limpieza automática:', error);
            // No lanzamos el error para que el worker continúe funcionando
            console.log('🔄 Reintentando limpieza en el próximo ciclo...');
        }
    }

    // Calcular estadísticas (para uso futuro)
    private async calcularEstadisticas(data: { establecimiento_id: number; periodo: string }) {
        try {
            console.log(`📊 Calculando estadísticas para establecimiento ${data.establecimiento_id}`);
        } catch (error) {
            console.error('❌ Error calculando estadísticas:', error);
            throw error;
        }
    }

    // Detener el worker
    async stop() {
        console.log('🛑 Deteniendo Activity Worker...');
        this.isRunning = false;
        
        try {
            await redisClient.disconnect();
            console.log('✅ Activity Worker detenido exitosamente');
        } catch (error) {
            console.error('❌ Error deteniendo worker:', error);
        }
    }

    // Configurar cierre graceful
    private setupGracefulShutdown() {
        process.on('SIGTERM', async () => {
            console.log('📡 Recibida señal SIGTERM, cerrando worker...');
            await this.stop();
            process.exit(0);
        });

        process.on('SIGINT', async () => {
            console.log('📡 Recibida señal SIGINT, cerrando worker...');
            await this.stop();
            process.exit(0);
        });
    }

    // Utilidad para pausar ejecución
    private sleep(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Servicio para enviar trabajos a la cola (simplificado)
export class ActivityQueueService {
    private static readonly QUEUE_NAME = 'activity_queue';

    // Enviar trabajo a la cola
    static async addJob(type: ActivityJob['type'], data: any): Promise<void> {
        try {
            const job: ActivityJob = {
                type,
                data,
                timestamp: Date.now(),
                id: `${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
            };

            // Agregar a la cola de Redis
            try {
                if (typeof redisClient.rPush === 'function') {
                    await redisClient.rPush(this.QUEUE_NAME, JSON.stringify(job));
                } else if (typeof redisClient.rpush === 'function') {
                    await redisClient.rpush(this.QUEUE_NAME, JSON.stringify(job));
                } else {
                    // Fallback: usar LPUSH
                    await redisClient.lPush(this.QUEUE_NAME, JSON.stringify(job));
                }
            } catch (error) {
                console.error('❌ Error agregando trabajo a Redis:', error);
                throw error;
            }
            
            console.log(`📤 Trabajo añadido a la cola: ${job.type} - ${job.id}`);
        } catch (error) {
            console.error('❌ Error añadiendo trabajo a la cola:', error);
            // Si Redis falla, procesamos directamente (fallback)
            if (type === 'registrar_actividad') {
                this.fallbackRegistrarActividad(data);
            }
        }
    }

    // Fallback para procesar directamente si Redis falla
    private static async fallbackRegistrarActividad(data: any) {
        try {
            const query = `
                INSERT INTO actividad_establecimiento 
                (fk_id_establecimiento, fk_id_usuario, tipo_actividad, datos_adicionales)
                VALUES ($1, $2, $3, $4)
            `;
            
            await db.query(query, [
                data.fk_id_establecimiento,
                data.fk_id_usuario || null,
                data.tipo_actividad,
                data.datos_adicionales ? JSON.stringify(data.datos_adicionales) : null
            ]);
            
            console.log('📊 Actividad registrada directamente (fallback)');
        } catch (error) {
            console.error('❌ Error en fallback de actividad:', error);
        }
    }

    // Método conveniente para registrar actividad
    static async registrarActividad(
        establecimientoId: number,
        usuarioId: number | undefined,
        tipoActividad: string,
        datosAdicionales?: any
    ): Promise<void> {
        await this.addJob('registrar_actividad', {
            fk_id_establecimiento: establecimientoId,
            fk_id_usuario: usuarioId,
            tipo_actividad: tipoActividad,
            datos_adicionales: datosAdicionales
        });
    }

    // Obtener estadísticas de la cola (simplificado)
    static async getQueueStats(): Promise<{ pending: number; processing: number }> {
        try {
            const pendingResult = await redisClient.lLen(this.QUEUE_NAME);
            const pending = typeof pendingResult === 'number' ? pendingResult : 0;
            
            return {
                pending,
                processing: 0 // Simplificado
            };
        } catch (error) {
            console.error('❌ Error obteniendo estadísticas de cola:', error);
            return { pending: 0, processing: 0 };
        }
    }
} 