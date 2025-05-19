import { Request, Response } from 'express';
import UserService from '../../services/userServices/UserService';
import RegisterUser from '../../Dto/UserDto/registerUserDto';

const registerUser = async (req: Request, res: Response) => {
    try {
        const { nombre, email, contraseña } = req.body;
        const userDto = new RegisterUser(nombre, email, contraseña);
        const usuario = await UserService.register(userDto);
        res.status(201).json({
            success: true,
            message: 'Usuario registrado. Revisa tu correo para confirmar tu cuenta.',
            usuario
        });
    } catch (error: any) {
        res.status(400).json({ success: false, message: error.message });
    }
};

export default registerUser;