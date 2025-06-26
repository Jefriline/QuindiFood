import { Request, Response, NextFunction } from 'express';
import verifyToken from '../UserValidator/verifyToken';
import simpleUserId from '../UserValidator/simpleUserId';
import { onlyAdmin } from '../UserValidator/onlyAdmin';

export const validarDatosCategoria = (req: Request, res: Response, next: NextFunction) => {
    try {
        const { nombre, descripcion } = req.body;

        if (!nombre || typeof nombre !== 'string' || nombre.trim().length === 0) {
            return res.status(400).json({
                success: false,
                message: 'El nombre de la categoría es obligatorio'
            });
        }

        if (nombre.length > 100) {
            return res.status(400).json({
                success: false,
                message: 'El nombre de la categoría no puede exceder 100 caracteres'
            });
        }

        if (descripcion !== undefined && typeof descripcion !== 'string') {
            return res.status(400).json({
                success: false,
                message: 'La descripción debe ser una cadena de texto'
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

export const validarIdCategoria = (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;

        if (!id || isNaN(parseInt(id)) || parseInt(id) <= 0) {
            return res.status(400).json({
                success: false,
                message: 'ID de categoría inválido'
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

// Middleware compuesto para crear categoría
export const validarCrearCategoriaCompleto = [
    verifyToken,
    simpleUserId,
    onlyAdmin,
    validarDatosCategoria
];

// Middleware compuesto para editar categoría
export const validarEditarCategoriaCompleto = [
    verifyToken,
    simpleUserId,
    onlyAdmin,
    validarIdCategoria,
    validarDatosCategoria
];

// Middleware compuesto para eliminar categoría
export const validarEliminarCategoriaCompleto = [
    verifyToken,
    simpleUserId,
    onlyAdmin,
    validarIdCategoria
];

// Middleware compuesto para listar categorías (público)
export const validarListarCategoriasCompleto = [
    // Sin middlewares de autenticación para permitir acceso público
]; 