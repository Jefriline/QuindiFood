import { Request, Response } from 'express';
import PromocionService from '../../services/PromocionService/promocionService';

const listarMisPromociones = async (req: Request, res: Response) => {
    try {
        const idUsuario = (req as any).user?.id;
        if (!idUsuario) {
            return res.status(401).json({ success: false, message: 'No autenticado' });
        }

        const promociones = await PromocionService.getPromocionesByEstablecimiento(idUsuario);

        return res.status(200).json({
            success: true,
            message: 'Promociones obtenidas exitosamente',
            data: promociones
        });
    } catch (error: any) {
        console.error('Error al listar promociones:', error);
        return res.status(500).json({
            success: false,
            message: 'Error al obtener las promociones',
            error: error?.message || 'Error desconocido'
        });
    }
};

export default listarMisPromociones; 