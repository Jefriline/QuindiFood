import { Request, Response, NextFunction } from 'express';

const addComentarioValidator = (req: Request, res: Response, next: NextFunction) => {
    const { id_establecimiento, cuerpo_comentario, id_comentario_padre } = req.body;

    if (!id_establecimiento || isNaN(Number(id_establecimiento))) {
        return res.status(400).json({
            status: 'Error',
            message: 'ID de establecimiento no proporcionado o inválido'
        });
    }
    if (!cuerpo_comentario || typeof cuerpo_comentario !== 'string' || cuerpo_comentario.trim().length === 0) {
        return res.status(400).json({
            status: 'Error',
            message: 'El cuerpo del comentario es obligatorio'
        });
    }
    if (cuerpo_comentario.length > 200) {
        return res.status(400).json({
            status: 'Error',
            message: 'El cuerpo del comentario no puede superar los 200 caracteres'
        });
    }
    if (id_comentario_padre && isNaN(Number(id_comentario_padre))) {
        return res.status(400).json({
            status: 'Error',
            message: 'ID de comentario padre inválido'
        });
    }
    next();
};

export default addComentarioValidator; 