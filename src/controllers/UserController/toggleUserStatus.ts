import { Request, Response } from 'express';
import UserService from '../../services/userServices/UserService';
import ToggleUserStatusDto from '../../Dto/UserDto/toggleUserStatusDto';

const toggleUserStatus = async (req: Request, res: Response) => {
    try {
        const id_usuario = parseInt(req.params.id);
        const estado = req.query.estado as string;
        
        if (isNaN(id_usuario)) {
            return res.status(400).json({
                success: false,
                message: 'ID de usuario inválido'
            });
        }

        const toggleDto = new ToggleUserStatusDto(id_usuario, estado);
        const result = await UserService.toggleUserStatus(toggleDto);

        if (!result.success) {
            return res.status(400).json(result);
        }

        return res.status(200).json(result);
    } catch (error) {
        console.error('Error en toggleUserStatus:', error);
        return res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
};

export default toggleUserStatus; 