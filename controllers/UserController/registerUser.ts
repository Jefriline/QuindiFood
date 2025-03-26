import { Request, Response } from 'express';
import UserService from '../../services/userServices/UserService';
import RegisterUser from '../../Dto/UserDto/registerUserDto';

let registerUser = async (req: Request, res: Response) => {
    try {
        const { nombre, email, contraseña } = req.body;

        const registerUser = await UserService.register(new RegisterUser(nombre, email, contraseña));
        
        return res.status(201).json({ status: 'Usuario registrado' });
    } catch (error: any) {
        return res.status(500).json({ error: error.message });
    }
};

export default registerUser;