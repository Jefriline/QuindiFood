import { Response } from 'express';
import ComentarioService from '../../services/ComentarioService/comentarioService';
import { CustomRequest } from '../../interfaces/customRequest';

const addComentario = async (req: CustomRequest, res: Response) => {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({
                status: 'Error',
                message: 'No se pudo obtener el ID del usuario del token'
            });
        }
        
        const { id_establecimiento, cuerpo_comentario, id_comentario_padre } = req.body;
        const id_usuario = req.user.id;
        
        const resultado = await ComentarioService.addComentario(
            Number(id_usuario),
            Number(id_establecimiento),
            cuerpo_comentario,
            id_comentario_padre ? Number(id_comentario_padre) : undefined
        );
        
        res.status(201).json(resultado);
    } catch (error: any) {
        console.error('Error en el controlador al añadir comentario:', error);
        if (error.message === 'El usuario no existe') {
            return res.status(404).json({ status: 'Error', message: 'El usuario no existe' });
        }
        if (error.message === 'El establecimiento no existe') {
            return res.status(404).json({ status: 'Error', message: 'El establecimiento no existe' });
        }
        if (error.message === 'El comentario padre no existe') {
            return res.status(404).json({ status: 'Error', message: 'El comentario padre no existe' });
        }
        if (error.message === 'El comentario padre no pertenece al mismo establecimiento') {
            return res.status(400).json({ status: 'Error', message: 'El comentario padre no pertenece al mismo establecimiento' });
        }
        res.status(500).json({ status: 'Error', message: 'Error interno del servidor' });
    }
};

export default addComentario;
