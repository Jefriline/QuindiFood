import { Request, Response } from 'express';
import EstadisticasService from '../../services/EstadisticasService/estadisticasService';
import { FiltrosEstadisticasDto } from '../../Dto/EstadisticasDto/estadisticasDto';

// Obtener dashboard de estadísticas
export const getDashboardEstadisticas = async (req: Request, res: Response) => {
    try {
        const usuarioId = (req as any).user?.id;
        
        if (!usuarioId) {
            return res.status(401).json({
                success: false,
                message: 'Usuario no autenticado'
            });
        }

        // Obtener filtros de la query
        const filtros: FiltrosEstadisticasDto = {
            fecha_inicio: req.query.fecha_inicio as string,
            fecha_fin: req.query.fecha_fin as string,
            tipo_periodo: req.query.tipo_periodo as any,
            tipos_actividad: req.query.tipos_actividad 
                ? (req.query.tipos_actividad as string).split(',')
                : undefined
        };

        console.log(`📊 Usuario ${usuarioId} solicitando dashboard de estadísticas`, filtros);

        const resultado = await EstadisticasService.getDashboardEstadisticas(usuarioId, filtros);

        if (!resultado.success) {
            return res.status(400).json(resultado);
        }

        return res.status(200).json({
            success: true,
            message: 'Dashboard de estadísticas obtenido exitosamente',
            data: resultado.data
        });

    } catch (error: any) {
        console.error('❌ Error en getDashboardEstadisticas:', error);
        return res.status(500).json({
            success: false,
            message: 'Error interno del servidor al obtener estadísticas',
            error: (typeof error === 'object' && error !== null && 'message' in error) ? (error as any).message : String(error) || 'Error desconocido'
        });
    }
};

// Exportar estadísticas
export const exportarEstadisticas = async (req: Request, res: Response) => {
    try {
        const usuarioId = (req as any).user?.id;
        
        if (!usuarioId) {
            return res.status(401).json({
                success: false,
                message: 'Usuario no autenticado'
            });
        }

        const filtros: FiltrosEstadisticasDto = {
            fecha_inicio: req.query.fecha_inicio as string,
            fecha_fin: req.query.fecha_fin as string,
            tipo_periodo: req.query.tipo_periodo as any,
            tipos_actividad: req.query.tipos_actividad 
                ? (req.query.tipos_actividad as string).split(',')
                : undefined
        };

        console.log(`📤 Usuario ${usuarioId} exportando estadísticas`, filtros);

        const resultado = await EstadisticasService.exportarEstadisticas(usuarioId, filtros);

        if (!resultado.success) {
            return res.status(400).json(resultado);
        }

        // Configurar headers para descarga
        const nombreArchivo = `estadisticas_${Date.now()}.json`;
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', `attachment; filename="${nombreArchivo}"`);

        return res.status(200).json({
            success: true,
            message: 'Estadísticas exportadas exitosamente',
            data: resultado.data,
            filename: nombreArchivo
        });

    } catch (error: any) {
        console.error('❌ Error en exportarEstadisticas:', error);
        return res.status(500).json({
            success: false,
            message: 'Error interno del servidor al exportar estadísticas',
            error: (typeof error === 'object' && error !== null && 'message' in error) ? (error as any).message : String(error) || 'Error desconocido'
        });
    }
};

// Obtener estadísticas rápidas (para widgets)
export const getEstadisticasRapidas = async (req: Request, res: Response) => {
    try {
        const usuarioId = (req as any).user?.id;
        
        if (!usuarioId) {
            return res.status(401).json({
                success: false,
                message: 'Usuario no autenticado'
            });
        }

        // Solo obtener estadísticas del último mes
        const filtros: FiltrosEstadisticasDto = {
            tipo_periodo: 'mes'
        };

        const resultado = await EstadisticasService.getDashboardEstadisticas(usuarioId, filtros);

        if (!resultado.success) {
            return res.status(400).json(resultado);
        }

        // Extraer solo los datos más importantes
        const estadisticasRapidas = {
            puntuacion_promedio: resultado.data?.estadisticas_generales.puntuaciones.promedio || 0,
            total_comentarios: resultado.data?.estadisticas_generales.comentarios.total || 0,
            clics_perfil: resultado.data?.estadisticas_generales.actividad.clics_perfil || 0,
            favoritos: resultado.data?.estadisticas_generales.actividad.favoritos_totales || 0,
            tendencia_clics: resultado.data?.tendencias.clics_vs_mes_anterior || 0,
            sentimiento_positivo: resultado.data?.estadisticas_generales.comentarios.porcentajes.positivos || 0
        };

        return res.status(200).json({
            success: true,
            message: 'Estadísticas rápidas obtenidas exitosamente',
            data: estadisticasRapidas
        });

    } catch (error: any) {
        console.error('❌ Error en getEstadisticasRapidas:', error);
        return res.status(500).json({
            success: false,
            message: 'Error interno del servidor al obtener estadísticas rápidas',
            error: (typeof error === 'object' && error !== null && 'message' in error) ? (error as any).message : String(error) || 'Error desconocido'
        });
    }
};

// Obtener actividad reciente (feed)
export const getActividadRecienteFeed = async (req: Request, res: Response) => {
    try {
        const usuarioId = (req as any).user?.id;
        if (!usuarioId) {
            return res.status(401).json({
                success: false,
                message: 'Usuario no autenticado'
            });
        }
        const feed = await EstadisticasService.getActividadReciente(usuarioId);
        return res.status(200).json({
            success: true,
            data: feed
        });
    } catch (error) {
        console.error('❌ Error en getActividadRecienteFeed:', error);
        return res.status(500).json({
            success: false,
            message: 'Error interno del servidor al obtener actividad reciente',
            error: (typeof error === 'object' && error !== null && 'message' in error) ? (error as any).message : String(error) || 'Error desconocido'
        });
    }
}; 