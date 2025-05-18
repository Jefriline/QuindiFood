import { Response } from "express";
import UserService from "../../services/userServices/UserService";
import UserProfileDto from "../../Dto/UserDto/userProfileDto";

const getUserById = async (req: any, res: Response) => {
    try {
        const userId = parseInt(req.params.id);
        
        if (!userId) {
            return res.status(400).json({
                status: 'Error',
                message: 'ID de usuario no válido'
            });
        }

        const user = await UserService.getById(new UserProfileDto(userId));

        if (!user) {
            return res.status(404).json({
                status: 'Error',
                message: 'Usuario no encontrado'
            });
        }

        // Formatear la respuesta para manejar valores nulos
        const formattedUser = {
            ...user,
            descripcion: user.descripcion || 'El usuario no tiene descripción',
            foto_perfil: user.foto_perfil || 'El usuario no tiene foto de perfil',
            plato_favorito: user.plato_favorito || 'El usuario no tiene plato favorito'
        };

        return res.status(200).json({
            status: 'Éxito',
            user: formattedUser
        });
    } catch (error: any) {
        console.error('Error al obtener usuario:', error);
        return res.status(500).json({
            status: 'Error',
            message: 'Error en el servidor',
            error: error.message
        });
    }
};

export default getUserById; 