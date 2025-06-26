import { Request, Response } from 'express';
import PromocionService from '../../services/PromocionService/promocionService';

const eliminarPromocion = async (req: Request, res: Response) => {
    try {
        const idUsuario = (req as any).user?.id;
        if (!idUsuario) {
            return res.status(401).json({ success: false, message: 'No autenticado' });
        }

        const { id } = req.params;
        if (!id || isNaN(parseInt(id))) {
            return res.status(400).json({ success: false, message: 'ID de promoción inválido' });
        }

        const resultado = await PromocionService.eliminarPromocion(parseInt(id), idUsuario);

        return res.status(200).json({
            success: true,
            message: 'Promoción eliminada exitosamente',
            data: resultado
        });
    } catch (error: any) {
        console.error('Error al eliminar promoción:', error);
        return res.status(500).json({
            success: false,
            message: 'Error al eliminar la promoción',
            error: error?.message || 'Error desconocido'
        });
    }
};

export default eliminarPromocion; 