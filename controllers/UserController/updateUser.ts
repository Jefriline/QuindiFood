import { Request, Response } from 'express';
import UserService from '../../services/userServices/UserService';
import UpdateUserDto from '../../Dto/UserDto/updateUserDto';

let updateUser = async (req: Request, res: Response) => {
    try {
        const { nombre, email, contraseña, descripcion, foto_perfil } = req.body;
        const id = parseInt(req.params.id);

        const updated = await UserService.update(new UpdateUserDto(id, nombre, email, contraseña, descripcion, foto_perfil));
        
        if (!updated) {
            return res.status(404).json({ status: 'Usuario no encontrado' });
        }

        return res.status(200).json({ status: 'Usuario actualizado correctamente' });
    } catch (error: any) {
        return res.status(500).json({ error: error.message });
    }
};

export default updateUser; 