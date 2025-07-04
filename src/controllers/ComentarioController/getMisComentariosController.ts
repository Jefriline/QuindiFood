import { Response } from 'express';
import ComentarioService from '../../services/ComentarioService/comentarioService';
import { CustomRequest } from '../../interfaces/customRequest';

const getMisComentarios = async (req: CustomRequest, res: Response) => {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({
                status: 'Error',
                message: 'No autenticado. Debes iniciar sesión para ver tus comentarios.'
            });
        }
        const comentarios = await ComentarioService.getComentariosByUsuario(Number(req.user.id));
        if (!comentarios || comentarios.comentarios.length === 0) {
            return res.status(200).json({
                status: 'Éxito',
                message: 'No tienes comentarios registrados.',
                comentarios: []
            });
        }
        res.status(200).json(comentarios);
    } catch (error: any) {
        console.error('Error al obtener mis comentarios:', error);
        res.status(500).json({
            status: 'Error',
            message: 'Ocurrió un error inesperado al obtener tus comentarios. Intenta nuevamente más tarde.'
        });
    }
};

export default getMisComentarios; 