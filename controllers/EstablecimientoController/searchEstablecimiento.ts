import { Request, Response } from 'express';
import SearchEstablecimientoService from '../../services/establecimientoServices/searchEstablecimientoService';
import SearchEstablecimientoDto from '../../Dto/EstablecimientoDto/searchEstablecimientoDto';

const searchEstablecimiento = async (req: Request, res: Response) => {
    try {
        const { nombre } = req.query;

        if (!nombre || typeof nombre !== 'string') {
            return res.status(400).json({
                success: false,
                message: 'El nombre del establecimiento es requerido'
            });
        }

        const searchDto = new SearchEstablecimientoDto(nombre);
        const result = await SearchEstablecimientoService.searchByName(searchDto);

        return res.status(200).json(result);
    } catch (error) {
        console.error('Error al buscar establecimiento:', error);
        return res.status(500).json({
            success: false,
            message: 'Error al buscar establecimiento',
            error: error instanceof Error ? error.message : 'Error desconocido'
        });
    }
};

export default searchEstablecimiento; 