import { Request, Response } from 'express';
import FavoritoService from '../../services/FavoritoService/favoritoService';

const getTotalFavoritos = async (req: Request, res: Response) => {
    try {
        const { id_establecimiento } = req.params;
        
        if (!id_establecimiento) {
            return res.status(400).json({
                status: 'Error',
                message: 'ID de establecimiento no proporcionado'
            });
        }

        const resultado = await FavoritoService.getTotalFavoritosByEstablecimiento(Number(id_establecimiento));
        res.status(200).json(resultado);
    } catch (error: any) {
        console.error('Error en el controlador al obtener total de favoritos:', error);
        
        // Manejar errores específicos
        if (error.message === 'El establecimiento no existe') {
            return res.status(404).json({
                status: 'Error',
                message: 'El establecimiento no existe'
            });
        }

        if (error.message === 'El establecimiento no tiene favoritos') {
            return res.status(200).json({
                status: 'Éxito',
                message: 'El establecimiento no tiene favoritos',
                total_favoritos: 0
            });
        }

        // Error genérico
        res.status(500).json({ 
            status: 'Error',
            message: 'Error interno del servidor' 
        });
    }
};

export default getTotalFavoritos; 