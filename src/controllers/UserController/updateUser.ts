import { Request, Response } from 'express';
import UserService from '../../services/userServices/UserService';
import UpdateUserDto from '../../Dto/UserDto/updateUserDto';

interface RequestWithUser extends Request {
    user?: {
        id: number;
    };
}

let updateUser = async (req: RequestWithUser, res: Response) => {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({
                status: 'Error',
                message: 'No se pudo obtener el ID del usuario del token'
            });
        }

        const { nombre, email, contraseña, descripcion } = req.body;
        const id = req.user.id;
        
        const updateDto = new UpdateUserDto(id, nombre, email, contraseña, descripcion);
        const result = await UserService.update(updateDto);
        
        if (!result.success) {
            return res.status(400).json({ 
                status: 'Error', 
                message: result.message
            });
        }

        return res.status(200).json({ 
            status: 'Éxito', 
            message: result.message
        });
    } catch (error: any) {
        console.error('Error al actualizar usuario:', error);
        return res.status(500).json({ 
            status: 'Error', 
            message: 'Error en el servidor', 
            error: error.message 
        });
    }
};

export default updateUser; 