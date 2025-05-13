import { Request, Response } from 'express';
import { EstablecimientoCompletoService } from '../../services/EstablecimientoService/establecimientoCompletoService';

const getEstablecimientosCompletos = async (req: Request, res: Response) => {
    try {
        const establecimientos = await EstablecimientoCompletoService.getAll();
        return res.status(200).json({
            success: true,
            message: "Establecimientos obtenidos exitosamente",
            data: establecimientos
        });
    } catch (error) {
        console.error('Error al obtener establecimientos completos:', error);
        return res.status(500).json({
            success: false,
            message: 'Error al obtener los establecimientos',
            error: error instanceof Error ? error.message : 'Error desconocido'
        });
    }
};

export default getEstablecimientosCompletos; 