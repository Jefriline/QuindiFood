import { ActivityQueueService } from './activityWorker';
import * as cron from 'node-cron';

// Worker para limpieza automática de registros antiguos
export class CleanupWorker {
    private static isRunning = false;
    private static cronJob: cron.ScheduledTask | null = null;

    // Iniciar el worker de limpieza
    static start() {
        if (this.isRunning) {
            console.log('🧹 Worker de limpieza ya está ejecutándose');
            return;
        }

        try {
            // Programar limpieza todos los días a las 2:00 AM
            this.cronJob = cron.schedule('0 2 * * *', async () => {
                console.log('🕐 Iniciando limpieza automática programada...');
                await this.ejecutarLimpieza();
            }, {
                timezone: "America/Bogota" // Hora de Colombia
            });

            // También programar limpieza semanal más profunda los domingos a las 3:00 AM
            cron.schedule('0 3 * * 0', async () => {
                console.log('🗑️ Iniciando limpieza semanal profunda...');
                await this.limpiezaProfunda();
            }, {
                timezone: "America/Bogota"
            });

            this.isRunning = true;
            console.log('✅ Worker de limpieza automática iniciado exitosamente');
            
            // Ejecutar limpieza inicial después de 30 segundos de iniciar el servidor
            setTimeout(async () => {
                console.log('🚀 Ejecutando limpieza inicial...');
                await this.ejecutarLimpieza();
            }, 30000);

        } catch (error) {
            console.error('❌ Error iniciando worker de limpieza:', error);
            throw error;
        }
    }

    // Detener el worker
    static stop() {
        if (this.cronJob) {
            this.cronJob.stop();
            this.cronJob = null;
        }
        
        this.isRunning = false;
        console.log('🛑 Worker de limpieza detenido');
    }

    // Ejecutar limpieza automática
    private static async ejecutarLimpieza(): Promise<void> {
        try {
            console.log('🧹 Iniciando proceso de limpieza automática...');
            
            // Añadir trabajo de limpieza a la cola de Redis
            await ActivityQueueService.addJob('limpiar_actividad_antigua', {
                tipo_limpieza: 'regular',
                ejecutado_por: 'cron_scheduler',
                timestamp: new Date().toISOString()
            });

            console.log('✅ Trabajo de limpieza añadido a la cola exitosamente');

            // Obtener estadísticas de la cola
            const stats = await ActivityQueueService.getQueueStats();
            console.log(`📊 Estado de la cola: ${stats.pending} pendientes, ${stats.processing} procesando`);

        } catch (error) {
            console.error('❌ Error ejecutando limpieza automática:', error);
        }
    }

    // Limpieza profunda semanal
    private static async limpiezaProfunda(): Promise<void> {
        try {
            console.log('🗑️ Iniciando limpieza semanal profunda...');
            
            // Limpiar actividad antigua
            await ActivityQueueService.addJob('limpiar_actividad_antigua', {
                tipo_limpieza: 'profunda',
                ejecutado_por: 'weekly_scheduler',
                timestamp: new Date().toISOString()
            });

            // Opcional: limpiar datos de Redis no utilizados
            await this.limpiarRedisCache();

            console.log('✅ Limpieza semanal profunda completada');

        } catch (error) {
            console.error('❌ Error en limpieza profunda:', error);
        }
    }

    // Limpiar cache de Redis que no se usa
    private static async limpiarRedisCache(): Promise<void> {
        try {
            // Aquí podrías implementar limpieza de keys de Redis
            // que ya no se necesitan, como trabajos muy antiguos, etc.
            console.log('🔄 Limpiando cache de Redis...');
            
            // Por ahora solo log, pero podrías implementar:
            // - Eliminar keys expiradas manualmente
            // - Limpiar trabajos fallidos muy antiguos
            // - Optimizar memoria de Redis
            
        } catch (error) {
            console.error('❌ Error limpiando cache de Redis:', error);
        }
    }

    // Método para ejecutar limpieza manual
    static async ejecutarLimpiezaManual(): Promise<void> {
        try {
            console.log('🔧 Ejecutando limpieza manual solicitada...');
            
            await ActivityQueueService.addJob('limpiar_actividad_antigua', {
                tipo_limpieza: 'manual',
                ejecutado_por: 'admin_request',
                timestamp: new Date().toISOString()
            });

            console.log('✅ Limpieza manual programada exitosamente');

        } catch (error) {
            console.error('❌ Error en limpieza manual:', error);
            throw error;
        }
    }

    // Obtener estado del worker
    static getStatus(): {
        running: boolean;
        nextExecution: string | null;
        lastExecution: string | null;
    } {
        return {
            running: this.isRunning,
            nextExecution: null,
            lastExecution: null
        };
    }

    // Configurar limpieza para desarrollo (cada 10 minutos en lugar de diario)
    static startDevelopmentMode() {
        if (process.env.NODE_ENV === 'development') {
            console.log('🧪 Iniciando worker de limpieza en modo desarrollo (cada 10 minutos)');
            
            this.cronJob = cron.schedule('*/10 * * * *', async () => {
                console.log('🧹 Limpieza de desarrollo ejecutándose...');
                await this.ejecutarLimpieza();
            });

            this.isRunning = true;
        }
    }
} 