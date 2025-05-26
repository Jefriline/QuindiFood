import { Response } from 'express';
import FavoritoService from '../../services/FavoritoService/favoritoService';
import { CustomRequest } from '../../interfaces/customRequest';

const removeFavorito = async (req: CustomRequest, res: Response) => {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({
                status: 'Error',
                message: 'No se pudo obtener el ID del usuario del token'
            });
        }

        const { id_establecimiento } = req.params;
        const id_cliente = req.user.id;

        const resultado = await FavoritoService.removeFavorito(
            Number(id_cliente),
            Number(id_establecimiento)
        );

        if (!resultado.success) {
            return res.status(400).json({
                status: 'Error',
                message: resultado.message
            });
        }

        res.status(200).json({
            status: 'Éxito',
            message: resultado.message
        });
    } catch (error: any) {
        console.error('Error en el controlador al eliminar favorito:', error);
        res.status(500).json({ 
            status: 'Error',
            message: error.message || 'Error interno del servidor' 
        });
    }
};

export default removeFavorito; 