import { Request, Response } from 'express';
import EstablecimientoService from '../../services/EstablecimientoService/establecimientoService';

const suspenderEstablecimiento = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        if (!id || isNaN(parseInt(id))) {
            return res.status(400).json({
                success: false,
                message: 'ID de establecimiento inválido'
            });
        }
        const resultado = await EstablecimientoService.suspenderEstablecimiento(parseInt(id));
        return res.status(200).json({
            success: true,
            message: 'Establecimiento suspendido exitosamente',
            data: resultado
        });
    } catch (error: any) {
        console.error('Error al suspender establecimiento:', error);
        return res.status(500).json({
            success: false,
            message: 'Error al suspender el establecimiento',
            error: error?.message || 'Error desconocido'
        });
    }
};

export default suspenderEstablecimiento; 