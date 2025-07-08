import { Request, Response } from 'express';
import PromocionRepository from '../../repositories/PromocionRepository/promocionRepository';

const detallePromocionPublica = async (req: Request, res: Response) => {
    try {
        const idPromocion = parseInt(req.params.id, 10);
        if (isNaN(idPromocion)) {
            return res.status(400).json({ success: false, message: 'ID de promoción inválido' });
        }
        const promocion = await PromocionRepository.getPromocionPublicaById(idPromocion);
        if (!promocion) {
            return res.status(404).json({ success: false, message: 'Promoción no encontrada' });
        }
        return res.status(200).json({ success: true, data: promocion });
    } catch (error) {
        console.error('Error en detallePromocionPublica:', error);
        return res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
};

export default detallePromocionPublica; 