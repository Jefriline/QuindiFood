import { Request, Response } from 'express';
import EstablecimientoService from '../../services/EstablecimientoService/establecimientoService';

const aprobarEstablecimiento = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { motivo } = req.body;

        if (!id || isNaN(parseInt(id))) {
            return res.status(400).json({
                success: false,
                message: 'ID de establecimiento inválido'
            });
        }

        const resultado = await EstablecimientoService.aprobarEstablecimiento(parseInt(id), motivo);

        return res.status(200).json({
            success: true,
            message: 'Establecimiento aprobado exitosamente',
            data: resultado
        });
    } catch (error: any) {
        console.error('Error al aprobar establecimiento:', error);
        return res.status(500).json({
            success: false,
            message: 'Error al aprobar el establecimiento',
            error: error?.message || 'Error desconocido'
        });
    }
};

export default aprobarEstablecimiento; 