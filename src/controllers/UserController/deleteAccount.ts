import { Response } from 'express';
import UserService from '../../services/userServices/UserService';
import { RequestWithUser } from '../../interfaces/request.interface';

let deleteAccount = async (req: RequestWithUser, res: Response) => {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({
                status: 'Error',
                message: 'No se pudo obtener el ID del usuario del token'
            });
        }

        const id = req.user.id;
        const result = await UserService.delete(id);
        
        if (!result.success) {
            return res.status(400).json({ 
                status: 'Error', 
                message: result.message
            });
        }

        return res.status(200).json({ 
            status: 'Éxito', 
            message: 'Cuenta eliminada exitosamente'
        });
    } catch (error: any) {
        console.error('Error al eliminar cuenta:', error);
        return res.status(500).json({ 
            status: 'Error', 
            message: 'Error en el servidor', 
            error: error.message 
        });
    }
};

export default deleteAccount; 