import { Request, Response } from 'express';
import CategoriaService from '../../services/CategoriaService/categoriaService';

// Listar categorías de establecimiento
export const listarCategoriasEstablecimiento = async (req: Request, res: Response) => {
    try {
        const categorias = await CategoriaService.getCategoriasEstablecimiento();

        return res.status(200).json({
            success: true,
            message: 'Categorías de establecimiento obtenidas exitosamente',
            data: categorias
        });
    } catch (error: any) {
        console.error('Error al listar categorías de establecimiento:', error);
        return res.status(500).json({
            success: false,
            message: 'Error al obtener las categorías de establecimiento',
            error: error?.message || 'Error desconocido'
        });
    }
};

// Crear categoría de establecimiento
export const crearCategoriaEstablecimiento = async (req: Request, res: Response) => {
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

        const categoria = await CategoriaService.crearCategoriaEstablecimiento(nombre.trim(), descripcion?.trim());

        return res.status(201).json({
            success: true,
            message: 'Categoría de establecimiento creada exitosamente',
            data: categoria
        });
    } catch (error: any) {
        console.error('Error al crear categoría de establecimiento:', error);
        return res.status(500).json({
            success: false,
            message: 'Error al crear la categoría de establecimiento',
            error: error?.message || 'Error desconocido'
        });
    }
};

// Editar categoría de establecimiento
export const editarCategoriaEstablecimiento = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { nombre, descripcion } = req.body;

        if (!id || isNaN(parseInt(id))) {
            return res.status(400).json({
                success: false,
                message: 'ID de categoría inválido'
            });
        }

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

        const categoria = await CategoriaService.editarCategoriaEstablecimiento(
            parseInt(id), 
            nombre.trim(), 
            descripcion?.trim()
        );

        return res.status(200).json({
            success: true,
            message: 'Categoría de establecimiento actualizada exitosamente',
            data: categoria
        });
    } catch (error: any) {
        console.error('Error al editar categoría de establecimiento:', error);
        return res.status(500).json({
            success: false,
            message: 'Error al editar la categoría de establecimiento',
            error: error?.message || 'Error desconocido'
        });
    }
};

// Eliminar categoría de establecimiento
export const eliminarCategoriaEstablecimiento = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        if (!id || isNaN(parseInt(id))) {
            return res.status(400).json({
                success: false,
                message: 'ID de categoría inválido'
            });
        }

        const resultado = await CategoriaService.eliminarCategoriaEstablecimiento(parseInt(id));

        return res.status(200).json({
            success: true,
            message: 'Categoría de establecimiento eliminada exitosamente',
            data: resultado
        });
    } catch (error: any) {
        console.error('Error al eliminar categoría de establecimiento:', error);
        return res.status(500).json({
            success: false,
            message: 'Error al eliminar la categoría de establecimiento',
            error: error?.message || 'Error desconocido'
        });
    }
}; 