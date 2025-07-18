import { Response } from 'express';
import RatingService from '../../services/userServices/RatingService';
import { CustomRequest } from '../../interfaces/customRequest';

const getRating = async (req: CustomRequest, res: Response) => {
    try {
        const id_establecimiento = parseInt(req.params.id_establecimiento);
        
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Usuario no autenticado'
            });
        }

        const result = await RatingService.getRating(req.user.id, id_establecimiento);

        if (!result.success) {
            return res.status(404).json(result);
        }

        return res.status(200).json(result);
    } catch (error) {
        console.error('Error en getRating:', error);
        return res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
};

export default getRating; 