import { Request, Response } from 'express';
import ProductoService from '../../services/ProductoService/productoService';

const eliminarProducto = async (req: Request, res: Response) => {
    try {
        const idUsuario = (req as any).user?.id;
        if (!idUsuario) {
            return res.status(401).json({ success: false, message: 'No autenticado' });
        }

        const { id } = req.params;
        if (!id || isNaN(parseInt(id))) {
            return res.status(400).json({ success: false, message: 'ID de producto inválido' });
        }

        const resultado = await ProductoService.eliminarProducto(parseInt(id), idUsuario);

        return res.status(200).json({
            success: true,
            message: 'Producto eliminado exitosamente',
            data: resultado
        });
    } catch (error: any) {
        console.error('Error al eliminar producto:', error);
        return res.status(500).json({
            success: false,
            message: 'Error al eliminar el producto',
            error: error?.message || 'Error desconocido'
        });
    }
};

export default eliminarProducto; 