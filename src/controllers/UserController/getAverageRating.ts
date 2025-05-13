import { Request, Response } from 'express';
import RatingService from '../../services/userServices/RatingService';

export const getAverageRating = async (req: Request, res: Response) => {
    try {
        const { id_establecimiento } = req.params;
        
        if (!id_establecimiento) {
            return res.status(400).json({
                success: false,
                message: 'El ID del establecimiento es requerido'
            });
        }

        const result = await RatingService.getAverageRating(Number(id_establecimiento));
        
        if (!result.success) {
            return res.status(400).json(result);
        }

        return res.status(200).json(result);
    } catch (error) {
        console.error('Error en getAverageRating:', error);
        return res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
};