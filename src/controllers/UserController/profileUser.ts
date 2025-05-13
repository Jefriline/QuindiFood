import { Response } from "express";
import UserService from "../../services/userServices/UserService";
import UserProfileDto from "../../Dto/UserDto/userProfileDto";
import { CustomRequest } from "../../interfaces/customRequest";

const userProfile = async (req: CustomRequest, res: Response) => {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({
                status: 'Error',
                message: 'No se pudo obtener el ID del usuario del token'
            });
        }

        const user = await UserService.getById(new UserProfileDto(req.user.id));

        if (!user) {
            return res.status(404).json({
                status: 'Error',
                message: 'Usuario no encontrado'
            });
        }

        return res.status(200).json({
            status: 'Éxito',
            user
        });
    } catch (error: any) {
        console.error('Error al obtener perfil:', error);
        return res.status(500).json({
            status: 'Error',
            message: 'Error en el servidor',
            error: error.message
        });
    }
};

export default userProfile; 