import { Request, Response } from 'express';
import FavoritoService from '../../services/FavoritoService/favoritoService';

const listFavoritos = async (req: Request, res: Response) => {
    try {
        const { id_cliente } = req.params;
        
        if (!id_cliente) {
            return res.status(400).json({
                status: 'Error',
                message: 'ID de usuario no proporcionado'
            });
        }

        const resultado = await FavoritoService.listFavoritosByCliente(Number(id_cliente));
        res.status(200).json(resultado);
    } catch (error: any) {
        console.error('Error en el controlador al listar favoritos:', error);
        
        // Manejar errores específicos
        if (error.message === 'El usuario no existe') {
            return res.status(404).json({
                status: 'Error',
                message: 'El usuario no existe'
            });
        }
        if (error.message === 'El usuario no es un cliente válido') {
            return res.status(400).json({
                status: 'Error',
                message: 'El usuario no es un cliente válido'
            });
        }
        if (error.message === 'El cliente no tiene establecimientos favoritos') {
            return res.status(200).json({
                status: 'Éxito',
                message: 'El cliente no tiene establecimientos favoritos',
                favoritos: []
            });
        }
        // Error genérico
        res.status(500).json({ 
            status: 'Error',
            message: 'Error interno del servidor' 
        });
    }
};

export default listFavoritos; 