import { Request, Response } from "express";
import UserService from "../../services/userServices/UserService";
import UserProfileDto from "../../Dto/UserDto/userProfileDto";

const userProfile = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id);
        const user = await UserService.getById(new UserProfileDto(id));

        if (!user) {
            return res.status(404).json({
                status: 404,
                error: 'Usuario no encontrado'
            });
        }

        return res.status(200).json({
            status: 200,
            data: user
        });
    } catch (error: any) {
        return res.status(500).json({
            status: 500,
            error: 'Error al obtener el perfil del usuario'
        });
    }
};

export default userProfile; 