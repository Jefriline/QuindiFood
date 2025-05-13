import { Response } from 'express';
import RatingService from '../../services/userServices/RatingService';
import RatingDto from '../../Dto/UserDto/ratingDto';
import { CustomRequest } from '../../interfaces/customRequest';

const updateRating = async (req: CustomRequest, res: Response) => {
    try {
        const { puntuacion } = req.body;
        const id_establecimiento = parseInt(req.params.id_establecimiento);
        
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Usuario no autenticado'
            });
        }

        const ratingDto = new RatingDto(req.user.id, id_establecimiento, puntuacion);
        const result = await RatingService.updateRating(ratingDto);

        if (!result.success) {
            return res.status(400).json(result);
        }

        return res.status(200).json(result);
    } catch (error) {
        console.error('Error en updateRating:', error);
        return res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
};

export default updateRating; 