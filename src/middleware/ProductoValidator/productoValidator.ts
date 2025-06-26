import { Request, Response, NextFunction } from 'express';

import { onlyPropietario } from '../UserValidator/onlyPropietario';
import verifyToken from '../UserValidator/verifyToken';
import verifyUserId from '../UserValidator/verifyUserId';

export const validarCrearProducto = (req: Request, res: Response, next: NextFunction) => {
    try {
        const { nombre, precio, FK_id_categoria_producto } = req.body;

        if (!nombre || !precio || !FK_id_categoria_producto) {
            return res.status(400).json({
                success: false,
                message: 'Nombre, precio y categoría son obligatorios'
            });
        }

        if (typeof nombre !== 'string' || nombre.trim().length === 0) {
            return res.status(400).json({
                success: false,
                message: 'El nombre debe ser una cadena válida'
            });
        }

        if (isNaN(parseFloat(precio)) || parseFloat(precio) < 0) {
            return res.status(400).json({
                success: false,
                message: 'El precio debe ser un número válido mayor o igual a 0'
            });
        }

        if (isNaN(parseInt(FK_id_categoria_producto)) || parseInt(FK_id_categoria_producto) <= 0) {
            return res.status(400).json({
                success: false,
                message: 'La categoría debe ser un ID válido'
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

export const validarEditarProducto = (req: Request, res: Response, next: NextFunction) => {
    try {
        const { nombre, precio, FK_id_categoria_producto } = req.body;

        if (nombre !== undefined && (typeof nombre !== 'string' || nombre.trim().length === 0)) {
            return res.status(400).json({
                success: false,
                message: 'El nombre debe ser una cadena válida'
            });
        }

        if (precio !== undefined && (isNaN(parseFloat(precio)) || parseFloat(precio) < 0)) {
            return res.status(400).json({
                success: false,
                message: 'El precio debe ser un número válido mayor o igual a 0'
            });
        }

        if (FK_id_categoria_producto !== undefined && (isNaN(parseInt(FK_id_categoria_producto)) || parseInt(FK_id_categoria_producto) <= 0)) {
            return res.status(400).json({
                success: false,
                message: 'La categoría debe ser un ID válido'
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

export const validarIdProducto = (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;

        if (!id || isNaN(parseInt(id)) || parseInt(id) <= 0) {
            return res.status(400).json({
                success: false,
                message: 'ID de producto inválido'
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

// Middleware compuesto para crear producto
export const validarCrearProductoCompleto = [
    verifyToken,
    verifyUserId,
    onlyPropietario,
    validarCrearProducto
];

// Middleware compuesto para editar producto
export const validarEditarProductoCompleto = [
    verifyToken,
    verifyUserId,
    onlyPropietario,
    validarIdProducto,
    validarEditarProducto
];

// Middleware compuesto para eliminar producto
export const validarEliminarProductoCompleto = [
    verifyToken,
    verifyUserId,
    onlyPropietario,
    validarIdProducto
];

// Middleware compuesto para listar mis productos
export const validarListarMisProductosCompleto = [
    verifyToken,
    verifyUserId,
    onlyPropietario
]; 