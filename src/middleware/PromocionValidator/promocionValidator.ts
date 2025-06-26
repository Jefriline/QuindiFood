import { Request, Response, NextFunction } from 'express';
import verifyToken from '../UserValidator/verifyToken';
import simpleUserId from '../UserValidator/simpleUserId';
import { onlyPropietario } from '../UserValidator/onlyPropietario';

export const validarCrearPromocion = (req: Request, res: Response, next: NextFunction) => {
    try {
        const { encabezado, descripcion, fecha_inicio, fecha_fin } = req.body;

        if (!encabezado || !descripcion || !fecha_inicio || !fecha_fin) {
            return res.status(400).json({
                success: false,
                message: 'Encabezado, descripción, fecha de inicio y fecha de fin son obligatorios'
            });
        }

        if (typeof encabezado !== 'string' || encabezado.trim().length === 0 || encabezado.length > 100) {
            return res.status(400).json({
                success: false,
                message: 'El encabezado debe ser una cadena válida de máximo 100 caracteres'
            });
        }

        if (typeof descripcion !== 'string' || descripcion.trim().length === 0) {
            return res.status(400).json({
                success: false,
                message: 'La descripción debe ser una cadena válida'
            });
        }

        // Validar fechas
        const fechaInicio = new Date(fecha_inicio);
        const fechaFin = new Date(fecha_fin);

        if (isNaN(fechaInicio.getTime()) || isNaN(fechaFin.getTime())) {
            return res.status(400).json({
                success: false,
                message: 'Las fechas deben tener un formato válido'
            });
        }

        if (fechaInicio >= fechaFin) {
            return res.status(400).json({
                success: false,
                message: 'La fecha de inicio debe ser anterior a la fecha de fin'
            });
        }

        if (fechaFin <= new Date()) {
            return res.status(400).json({
                success: false,
                message: 'La fecha de fin debe ser posterior a la fecha actual'
            });
        }

        next();
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error en la validación'
        });
    }
};

export const validarEditarPromocion = (req: Request, res: Response, next: NextFunction) => {
    try {
        const { encabezado, descripcion, fecha_inicio, fecha_fin } = req.body;

        if (encabezado !== undefined && (typeof encabezado !== 'string' || encabezado.trim().length === 0 || encabezado.length > 100)) {
            return res.status(400).json({
                success: false,
                message: 'El encabezado debe ser una cadena válida de máximo 100 caracteres'
            });
        }

        if (descripcion !== undefined && (typeof descripcion !== 'string' || descripcion.trim().length === 0)) {
            return res.status(400).json({
                success: false,
                message: 'La descripción debe ser una cadena válida'
            });
        }

        // Validar fechas si se proporcionan
        if (fecha_inicio !== undefined || fecha_fin !== undefined) {
            const fechaInicio = fecha_inicio ? new Date(fecha_inicio) : undefined;
            const fechaFin = fecha_fin ? new Date(fecha_fin) : undefined;

            if (fechaInicio && isNaN(fechaInicio.getTime())) {
                return res.status(400).json({
                    success: false,
                    message: 'La fecha de inicio debe tener un formato válido'
                });
            }

            if (fechaFin && isNaN(fechaFin.getTime())) {
                return res.status(400).json({
                    success: false,
                    message: 'La fecha de fin debe tener un formato válido'
                });
            }

            if (fechaInicio && fechaFin && fechaInicio >= fechaFin) {
                return res.status(400).json({
                    success: false,
                    message: 'La fecha de inicio debe ser anterior a la fecha de fin'
                });
            }

            if (fechaFin && fechaFin <= new Date()) {
                return res.status(400).json({
                    success: false,
                    message: 'La fecha de fin debe ser posterior a la fecha actual'
                });
            }
        }

        next();
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error en la validación'
        });
    }
};

export const validarIdPromocion = (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;

        if (!id || isNaN(parseInt(id)) || parseInt(id) <= 0) {
            return res.status(400).json({
                success: false,
                message: 'ID de promoción inválido'
            });
        }

        next();
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error en la validación'
        });
    }
};

// Middleware compuesto para crear promoción
export const validarCrearPromocionCompleto = [
    verifyToken,
    simpleUserId,
    onlyPropietario,
    validarCrearPromocion
];

// Middleware compuesto para editar promoción
export const validarEditarPromocionCompleto = [
    verifyToken,
    simpleUserId,
    onlyPropietario,
    validarIdPromocion,
    validarEditarPromocion
];

// Middleware compuesto para eliminar promoción
export const validarEliminarPromocionCompleto = [
    verifyToken,
    simpleUserId,
    onlyPropietario,
    validarIdPromocion
];

// Middleware compuesto para listar mis promociones
export const validarListarMisPromocionesCompleto = [
    verifyToken,
    simpleUserId,
    onlyPropietario
]; 