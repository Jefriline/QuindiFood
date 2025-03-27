import { Request, Response } from 'express';
import FavoritosService from '../../services/FavoritosService/favoritosService';
import { FavoritosDto } from '../../Dto/FavoritosDto/favoritosDto';

const addFavorito = async (req: Request, res: Response) => {
    try {
        const id_establecimiento = parseInt(req.params.id);
        const id_cliente = req.user?.id;

        if (!id_cliente) {
            return res.status(401).json({
                success: false,
                message: 'Usuario no autenticado'
            });
        }

        if (isNaN(id_establecimiento)) {
            return res.status(400).json({
                success: false,
                message: 'ID de establecimiento inválido'
            });
        }

        const favorito = new FavoritosDto(
            id_cliente,
            id_establecimiento
        );

        await FavoritosService.add(favorito);

        return res.status(201).json({
            success: true,
            message: 'Establecimiento agregado a favoritos exitosamente'
        });
    } catch (error) {
        console.error('Error al agregar favorito:', error);
        return res.status(500).json({
            success: false,
            message: 'Error al agregar el establecimiento a favoritos',
            error: error instanceof Error ? error.message : 'Error desconocido'
        });
    }
};

export default addFavorito; 