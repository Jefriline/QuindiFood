import { Request, Response } from 'express';
import ListEstablecimientoService from '../../services/EstablecimientoService/listEstablecimientoService';

const listEstablecimientos = async (req: Request, res: Response) => {
    try {
        const establecimientos = await ListEstablecimientoService.getAll();
        return res.status(200).json({
            success: true,
            message: "Establecimientos obtenidos exitosamente",
            data: establecimientos
        });
    } catch (error) {
        console.error('Error al listar establecimientos:', error);
        return res.status(500).json({
            success: false,
            message: 'Error al obtener establecimientos',
            error: error
        });
    }
};

export default listEstablecimientos; 