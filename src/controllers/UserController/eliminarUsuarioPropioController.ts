import { Request, Response } from 'express';
import UserService from '../../services/userServices/UserService';

const eliminarUsuarioPropio = async (req: Request, res: Response) => {
    try {
        const idUsuario = (req as any).user?.id;
        if (!idUsuario) {
            return res.status(401).json({ success: false, message: 'No autenticado' });
        }
        const resultado = await UserService.eliminarUsuarioCompleto(idUsuario, false, idUsuario);
        return res.status(200).json(resultado);
    } catch (error: any) {
        return res.status(500).json({ success: false, message: error.message });
    }
};
export default eliminarUsuarioPropio; 