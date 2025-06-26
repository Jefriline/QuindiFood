import { Request, Response } from 'express';
import PromocionService from '../../services/PromocionService/promocionService';

const listarPromocionesActivas = async (req: Request, res: Response) => {
    try {
        const promociones = await PromocionService.getPromocionesActivasPublicas();

        return res.status(200).json({
            success: true,
            message: 'Promociones activas obtenidas exitosamente',
            data: promociones
        });
    } catch (error: any) {
        console.error('Error al listar promociones activas:', error);
        return res.status(500).json({
            success: false,
            message: 'Error al obtener las promociones activas',
            error: error?.message || 'Error desconocido'
        });
    }
};

export default listarPromocionesActivas; 