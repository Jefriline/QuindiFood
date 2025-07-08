import { Request, Response, NextFunction } from 'express';
import { body, query, validationResult } from 'express-validator';

// Validador para dashboard de estadísticas
export const validarDashboardEstadisticas = [
    query('fecha_inicio')
        .optional()
        .isISO8601()
        .withMessage('Fecha de inicio debe tener formato válido (YYYY-MM-DD)'),
    
    query('fecha_fin')
        .optional()
        .isISO8601()
        .withMessage('Fecha de fin debe tener formato válido (YYYY-MM-DD)')
        .custom((value, { req }) => {
            if (value && req.query?.fecha_inicio) {
                const fechaInicio = new Date(req.query.fecha_inicio as string);
                const fechaFin = new Date(value);
                if (fechaFin <= fechaInicio) {
                    throw new Error('Fecha de fin debe ser posterior a fecha de inicio');
                }
            }
            return true;
        }),
    
    query('tipo_periodo')
        .optional()
        .isIn(['dia', 'semana', 'mes', 'trimestre', 'año'])
        .withMessage('Tipo de período debe ser: dia, semana, mes, trimestre o año'),
    
    query('tipos_actividad')
        .optional()
        .custom((value) => {
            if (value) {
                const tipos = value.split(',');
                const tiposValidos = ['clic_perfil', 'comentario', 'puntuacion', 'favorito', 'busqueda'];
                
                for (const tipo of tipos) {
                    if (!tiposValidos.includes(tipo.trim())) {
                        throw new Error(`Tipo de actividad inválido: ${tipo}`);
                    }
                }
            }
            return true;
        })
        .withMessage('Tipos de actividad deben ser: clic_perfil, comentario, puntuacion, favorito, busqueda'),

    (req: Request, res: Response, next: NextFunction) => {
        const errors = validationResult(req);
        
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Errores de validación en los parámetros',
                errors: errors.array().map(error => ({
                    campo: (error as any).path || 'desconocido',
                    mensaje: error.msg,
                    valor: (error as any).value || null
                }))
            });
        }
        
        next();
    }
];

// Validador para exportar estadísticas
export const validarExportarEstadisticas = [
    query('fecha_inicio')
        .optional()
        .isISO8601()
        .withMessage('Fecha de inicio debe tener formato válido (YYYY-MM-DD)'),
    
    query('fecha_fin')
        .optional()
        .isISO8601()
        .withMessage('Fecha de fin debe tener formato válido (YYYY-MM-DD)')
        .custom((value, { req }) => {
            if (value && req.query?.fecha_inicio) {
                const fechaInicio = new Date(req.query.fecha_inicio as string);
                const fechaFin = new Date(value);
                
                // Validar que no sean más de 6 meses de diferencia para evitar exports muy grandes
                const diferenciaMeses = (fechaFin.getTime() - fechaInicio.getTime()) / (1000 * 60 * 60 * 24 * 30);
                
                if (diferenciaMeses > 6) {
                    throw new Error('El rango de exportación no puede ser mayor a 6 meses');
                }
                
                if (fechaFin <= fechaInicio) {
                    throw new Error('Fecha de fin debe ser posterior a fecha de inicio');
                }
            }
            return true;
        }),
    
    query('tipo_periodo')
        .optional()
        .isIn(['dia', 'semana', 'mes', 'trimestre'])
        .withMessage('Para exportar, tipo de período debe ser: dia, semana, mes o trimestre'),

    (req: Request, res: Response, next: NextFunction) => {
        const errors = validationResult(req);
        
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Errores de validación para exportar estadísticas',
                errors: errors.array().map(error => ({
                    campo: (error as any).path || 'desconocido',
                    mensaje: error.msg,
                    valor: (error as any).value || null
                }))
            });
        }
        
        next();
    }
];

// Validador simple para estadísticas rápidas (sin parámetros)
export const validarEstadisticasRapidas = [
    (req: Request, res: Response, next: NextFunction) => {
        // Solo verificar que sea una petición válida
        if (req.method !== 'GET') {
            return res.status(405).json({
                success: false,
                message: 'Método no permitido. Use GET para estadísticas rápidas'
            });
        }
        
        next();
    }
];

// Validador para actividad reciente
export const validarActividadReciente = [
    query('dias')
        .optional()
        .isInt({ min: 1, max: 30 })
        .withMessage('Días debe ser un número entre 1 y 30'),

    (req: Request, res: Response, next: NextFunction) => {
        const errors = validationResult(req);
        
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Errores de validación en actividad reciente',
                errors: errors.array().map(error => ({
                    campo: (error as any).path || 'desconocido',
                    mensaje: error.msg,
                    valor: (error as any).value || null
                }))
            });
        }
        
        next();
    }
];

// Middleware para verificar que el usuario es propietario
export const verificarPropietario = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const usuarioId = (req as any).user?.id;
        const userRole = (req as any).user?.role;
        
        if (!usuarioId) {
            return res.status(401).json({
                success: false,
                message: 'Usuario no autenticado'
            });
        }

        // Verificar que el usuario sea propietario
        if (userRole !== 'PROPIETARIO') {
            return res.status(403).json({
                success: false,
                message: 'Acceso denegado. Solo propietarios pueden ver estadísticas'
            });
        }

        next();
    } catch (error) {
        console.error('❌ Error verificando propietario:', error);
        return res.status(500).json({
            success: false,
            message: 'Error interno verificando permisos'
        });
    }
};

// Middleware completo para dashboard
export const validarDashboardCompleto = [
    verificarPropietario,
    ...validarDashboardEstadisticas
];

// Middleware completo para exportar
export const validarExportarCompleto = [
    verificarPropietario,
    ...validarExportarEstadisticas
];

// Middleware completo para estadísticas rápidas
export const validarEstadisticasRapidasCompleto = [
    verificarPropietario,
    ...validarEstadisticasRapidas
];

// Middleware completo para actividad reciente
export const validarActividadRecienteCompleto = [
    verificarPropietario,
    ...validarActividadReciente
]; 