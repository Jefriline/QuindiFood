import { Request, Response } from 'express';
import EstablecimientoService from '../../services/EstablecimientoService/establecimientoService';

const listEstablecimientos = async (req: Request, res: Response) => {
    try {
        const establecimientos = await EstablecimientoService.getAll();
        
        return res.status(200).json({
            message: 'Establecimientos obtenidos exitosamente',
            data: establecimientos
        });
    } catch (error) {
        console.error('Error al listar establecimientos:', error);
        return res.status(500).json({
            message: 'Error al obtener los establecimientos',
            error: error instanceof Error ? error.message : 'Error desconocido'
        });
    }
};

export default listEstablecimientos; 