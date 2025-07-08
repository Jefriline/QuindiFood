import { createClient } from 'redis';

// Configuración simple de Redis
const redisClient = createClient({
    url: 'redis://default:yDTApseultakz4Btb9YolRtCvjRifzIl@redis-11101.c53.west-us.azure.redns.redis-cloud.com:11101'
});

// Manejo de errores básico
redisClient.on('error', (err) => {
    console.error('Redis Client Error:', err);
});

// Función para conectar (API Redis v5)
export const connectRedis = async () => {
    try {
        // En Redis v5, simplemente intentamos conectar
        await redisClient.connect();
        console.log('✅ Redis conectado exitosamente');
        return redisClient;
    } catch (error) {
        console.error('❌ Error conectando a Redis:', error);
        throw error;
    }
};

// Función para desconectar (API Redis v5)
export const disconnectRedis = async () => {
    try {
        await redisClient.disconnect();
        console.log('🔌 Redis desconectado');
    } catch (error) {
        console.error('❌ Error desconectando Redis:', error);
    }
};

export default redisClient; 