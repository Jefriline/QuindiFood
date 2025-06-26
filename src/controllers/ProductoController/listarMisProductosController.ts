import { Request, Response } from 'express';
import ProductoService from '../../services/ProductoService/productoService';

const listarMisProductos = async (req: Request, res: Response) => {
    try {
        const idUsuario = (req as any).user?.id;
        if (!idUsuario) {
            return res.status(401).json({ success: false, message: 'No autenticado' });
        }

        const productos = await ProductoService.getProductosByEstablecimiento(idUsuario);

        return res.status(200).json({
            success: true,
            message: 'Productos obtenidos exitosamente',
            data: productos
        });
    } catch (error: any) {
        console.error('Error al listar productos:', error);
        return res.status(500).json({
            success: false,
            message: 'Error al obtener los productos',
            error: error?.message || 'Error desconocido'
        });
    }
};

export default listarMisProductos; 