import { Response } from 'express';
import ComentarioService from '../../services/ComentarioService/comentarioService';
import { CustomRequest } from '../../interfaces/customRequest';

const deleteComentario = async (req: CustomRequest, res: Response) => {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({
                status: 'Error',
                message: 'No se pudo obtener el ID del usuario del token'
            });
        }
        const { id_comentario } = req.params;
        const id_cliente = req.user.id;
        const resultado = await ComentarioService.deleteComentarioByIdAndCliente(Number(id_comentario), Number(id_cliente));
        res.status(200).json(resultado);
    } catch (error: any) {
        console.error('Error en el controlador al eliminar comentario:', error);
        if (error.message === 'El comentario no existe') {
            return res.status(404).json({ status: 'Error', message: 'El comentario no existe' });
        }
        if (error.message === 'No tienes permiso para eliminar este comentario') {
            return res.status(403).json({ status: 'Error', message: 'No tienes permiso para eliminar este comentario' });
        }
        res.status(500).json({ status: 'Error', message: 'Error interno del servidor' });
    }
};

export default deleteComentario; 