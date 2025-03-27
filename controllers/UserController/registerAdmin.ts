import { Request, Response } from 'express';
import UserService from '../../services/userServices/UserService';
import RegisterAdmin from '../../Dto/UserDto/registerAdminDto';

const registerAdmin = async (req: Request, res: Response) => {
    try {
        const { nombre, email, contraseña, codigoAdmin } = req.body;

        const registerAdmin = await UserService.registerAdmin(new RegisterAdmin(nombre, email, contraseña, codigoAdmin));
        
        return res.status(201).json({ status: 'Administrador registrado' });
    } catch (error: any) {
        return res.status(500).json({ error: error.message });
    }
};

export default registerAdmin; 