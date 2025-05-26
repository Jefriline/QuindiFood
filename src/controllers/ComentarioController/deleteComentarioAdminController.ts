import { Request, Response } from 'express';
import ComentarioService from '../../services/ComentarioService/comentarioService';

const deleteComentarioAdmin = async (req: Request, res: Response) => {
    try {
        const { id_comentario } = req.params;
        const resultado = await ComentarioService.deleteComentarioByIdAdmin(Number(id_comentario));
        res.status(200).json(resultado);
    } catch (error: any) {
        console.error('Error en el controlador admin al eliminar comentario:', error);
        if (error.message === 'El comentario no existe') {
            return res.status(404).json({ status: 'Error', message: 'El comentario no existe' });
        }
        res.status(500).json({ status: 'Error', message: 'Error interno del servidor' });
    }
};

export default deleteComentarioAdmin; 