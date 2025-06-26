import { Request, Response } from 'express';
import CategoriaService from '../../services/CategoriaService/categoriaService';

// Listar categorías de producto
export const listarCategoriasProducto = async (req: Request, res: Response) => {
    try {
        const categorias = await CategoriaService.getCategoriasProducto();

        return res.status(200).json({
            success: true,
            message: 'Categorías de producto obtenidas exitosamente',
            data: categorias
        });
    } catch (error: any) {
        console.error('Error al listar categorías de producto:', error);
        return res.status(500).json({
            success: false,
            message: 'Error al obtener las categorías de producto',
            error: error?.message || 'Error desconocido'
        });
    }
};

// Crear categoría de producto
export const crearCategoriaProducto = async (req: Request, res: Response) => {
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

        const categoria = await CategoriaService.crearCategoriaProducto(nombre.trim(), descripcion?.trim());

        return res.status(201).json({
            success: true,
            message: 'Categoría de producto creada exitosamente',
            data: categoria
        });
    } catch (error: any) {
        console.error('Error al crear categoría de producto:', error);
        return res.status(500).json({
            success: false,
            message: 'Error al crear la categoría de producto',
            error: error?.message || 'Error desconocido'
        });
    }
};

// Editar categoría de producto
export const editarCategoriaProducto = async (req: Request, res: Response) => {
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

        const categoria = await CategoriaService.editarCategoriaProducto(
            parseInt(id), 
            nombre.trim(), 
            descripcion?.trim()
        );

        return res.status(200).json({
            success: true,
            message: 'Categoría de producto actualizada exitosamente',
            data: categoria
        });
    } catch (error: any) {
        console.error('Error al editar categoría de producto:', error);
        return res.status(500).json({
            success: false,
            message: 'Error al editar la categoría de producto',
            error: error?.message || 'Error desconocido'
        });
    }
};

// Eliminar categoría de producto
export const eliminarCategoriaProducto = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        if (!id || isNaN(parseInt(id))) {
            return res.status(400).json({
                success: false,
                message: 'ID de categoría inválido'
            });
        }

        const resultado = await CategoriaService.eliminarCategoriaProducto(parseInt(id));

        return res.status(200).json({
            success: true,
            message: 'Categoría de producto eliminada exitosamente',
            data: resultado
        });
    } catch (error: any) {
        console.error('Error al eliminar categoría de producto:', error);
        return res.status(500).json({
            success: false,
            message: 'Error al eliminar la categoría de producto',
            error: error?.message || 'Error desconocido'
        });
    }
}; 