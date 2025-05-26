import { Request, Response } from 'express';
import ComentarioService from '../../services/ComentarioService/comentarioService';
import db from '../../config/config-db';

const getComentariosEstablecimiento = async (req: Request, res: Response) => {
    try {
        const { id_establecimiento } = req.params;
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        if (!id_establecimiento) {
            return res.status(400).json({
                status: 'Error',
                message: 'Debes proporcionar el ID del establecimiento.'
            });
        }
        // Verificar que el establecimiento existe
        const establecimiento = await db.query('SELECT 1 FROM establecimiento WHERE id_establecimiento = $1', [id_establecimiento]);
        if (establecimiento.rows.length === 0) {
            return res.status(404).json({
                status: 'Error',
                message: 'El establecimiento solicitado no existe.'
            });
        }
        const resultado = await ComentarioService.getComentariosByEstablecimientoPaginado(Number(id_establecimiento), page, limit);
        if (!resultado.comentarios || resultado.comentarios.length === 0) {
            return res.status(404).json({
                status: 'Éxito',
                message: 'Este establecimiento aún no tiene comentarios.'
            });
        }
        res.status(200).json({
            ...resultado,
            message: undefined // No incluir mensaje si hay comentarios
        });
    } catch (error: any) {
        console.error('Error al obtener comentarios de establecimiento:', error);
        res.status(500).json({
            status: 'Error',
            message: 'Ocurrió un error inesperado al obtener los comentarios del establecimiento. Intenta nuevamente más tarde.'
        });
    }
};

export default getComentariosEstablecimiento; 