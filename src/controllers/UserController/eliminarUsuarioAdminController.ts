import { Request, Response } from 'express';
import UserService from '../../services/userServices/UserService';

const eliminarUsuarioAdmin = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        if (!id || isNaN(parseInt(id))) {
            return res.status(400).json({ success: false, message: 'ID inválido' });
        }
        const resultado = await UserService.eliminarUsuarioCompleto(parseInt(id), true);
        return res.status(200).json(resultado);
    } catch (error: any) {
        return res.status(500).json({ success: false, message: error.message });
    }
};
export default eliminarUsuarioAdmin; 