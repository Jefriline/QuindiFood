import { Request, Response } from 'express';
import EstablecimientoService from '../../services/EstablecimientoService/establecimientoService';

const rechazarEstablecimiento = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { motivo } = req.body;

        if (!id || isNaN(parseInt(id))) {
            return res.status(400).json({
                success: false,
                message: 'ID de establecimiento inválido'
            });
        }

        if (!motivo || motivo.trim() === '') {
            return res.status(400).json({
                success: false,
                message: 'El motivo del rechazo es obligatorio'
            });
        }

        const resultado = await EstablecimientoService.rechazarEstablecimiento(parseInt(id), motivo);

        return res.status(200).json({
            success: true,
            message: 'Establecimiento rechazado exitosamente',
            data: resultado
        });
    } catch (error: any) {
        console.error('Error al rechazar establecimiento:', error);
        return res.status(500).json({
            success: false,
            message: 'Error al rechazar el establecimiento',
            error: error?.message || 'Error desconocido'
        });
    }
};

export default rechazarEstablecimiento; 