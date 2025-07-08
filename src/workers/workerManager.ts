import { ActivityWorker } from './activityWorker';
import { CleanupWorker } from './cleanupWorker';
import { connectRedis } from '../config/redis-config';

// Manager para gestionar todos los workers del sistema
export class WorkerManager {
    private static activityWorker: ActivityWorker | null = null;
    private static isInitialized = false;

    // Inicializar todos los workers
    static async initialize(): Promise<void> {
        if (this.isInitialized) {
            console.log('🔄 Workers ya están inicializados');
            return;
        }

        try {
            console.log('🚀 Inicializando sistema de workers...');
            
            // Conectar a Redis una sola vez
            await connectRedis();
            console.log('✅ Conexión a Redis establecida');

            // Inicializar Activity Worker
            this.activityWorker = new ActivityWorker();
            await this.activityWorker.start();

            // Inicializar Cleanup Worker
            CleanupWorker.start();

            this.isInitialized = true;
            console.log('✅ Todos los workers inicializados exitosamente');

        } catch (error: any) {
            console.error('❌ Error inicializando workers:', error);
            // Si es error de conexión múltiple, continuar
            if (error.message && error.message.includes('Socket already opened')) {
                console.log('🔄 Redis ya conectado, continuando con workers...');
                this.isInitialized = true;
            } else {
                throw error;
            }
        }
    }

    // Detener todos los workers
    static async shutdown(): Promise<void> {
        console.log('🛑 Deteniendo workers...');
        
        if (this.activityWorker) {
            await this.activityWorker.stop();
        }
        
        CleanupWorker.stop();
        this.isInitialized = false;
        
        console.log('✅ Workers detenidos exitosamente');
    }

    // Obtener estado de los workers
    static getStatus(): {
        initialized: boolean;
        activityWorker: string;
        cleanupWorker: string;
    } {
        return {
            initialized: this.isInitialized,
            activityWorker: this.activityWorker ? 'running' : 'stopped',
            cleanupWorker: 'running' // CleanupWorker es estático
        };
    }

    // Reiniciar workers
    static async restart(): Promise<void> {
        console.log('🔄 Reiniciando workers...');
        
        await this.shutdown();
        await new Promise(resolve => setTimeout(resolve, 2000)); // Esperar 2 segundos
        await this.initialize();
        
        console.log('✅ Workers reiniciados exitosamente');
    }

    // Verificar salud de los workers
    static async healthCheck(): Promise<{
        status: 'healthy' | 'degraded' | 'unhealthy';
        details: any;
    }> {
        try {
            const status = this.getStatus();
            
            // Verificar si todos los componentes están funcionando
            const isHealthy = status.initialized && 
                             status.activityWorker === 'running' && 
                             status.cleanupWorker === 'running';

            return {
                status: isHealthy ? 'healthy' : 'degraded',
                details: {
                    ...status,
                    timestamp: new Date().toISOString()
                }
            };

        } catch (error) {
            console.error('❌ Error en health check:', error);
            return {
                status: 'unhealthy',
                details: {
                    error: error instanceof Error ? error.message : 'Unknown error',
                    timestamp: new Date().toISOString()
                }
            };
        }
    }

    // Configurar cierre graceful del sistema
    private static setupGracefulShutdown(): void {
        const gracefulShutdown = async (signal: string) => {
            console.log(`📡 Recibida señal ${signal}, cerrando workers...`);
            
            await this.shutdown();
            process.exit(0);
        };

        // Escuchar señales del sistema
        process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
        process.on('SIGINT', () => gracefulShutdown('SIGINT'));
        
        // Manejar errores no capturados
        process.on('uncaughtException', async (error) => {
            console.error('💥 Error no capturado:', error);
            await this.shutdown();
            process.exit(1);
        });

        process.on('unhandledRejection', async (reason, promise) => {
            console.error('💥 Promise rejection no manejada en:', promise, 'razón:', reason);
            await this.shutdown();
            process.exit(1);
        });
    }

    // Métodos de utilidad para desarrollo y testing
    static async executeManualCleanup(): Promise<void> {
        if (!this.isInitialized) {
            throw new Error('Workers no están inicializados');
        }

        await CleanupWorker.ejecutarLimpiezaManual();
    }

    static async getQueueStats(): Promise<any> {
        if (!this.isInitialized) {
            throw new Error('Workers no están inicializados');
        }

        // Aquí podrías obtener estadísticas detalladas de las colas
        // Por ahora retornamos un estado básico
        return {
            timestamp: new Date().toISOString(),
            workers_running: this.getStatus()
        };
    }
} 