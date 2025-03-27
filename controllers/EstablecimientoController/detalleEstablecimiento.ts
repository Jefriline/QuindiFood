import { Request, Response } from 'express';
import DetalleEstablecimientoService from '../../services/EstablecimientoService/detalleEstablecimientoService';

const getDetalleEstablecimiento = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id);
        
        // Validar que el ID sea un número válido
        if (isNaN(id)) {
            return res.status(400).json({
                success: false,
                message: 'El ID debe ser un número válido'
            });
        }

        const establecimiento = await DetalleEstablecimientoService.getById(id);
        
        if (!establecimiento) {
            return res.status(404).json({
                success: false,
                message: 'Establecimiento no encontrado'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Detalle del establecimiento obtenido exitosamente',
            data: establecimiento
        });
    } catch (error) {
        console.error('Error al obtener detalle del establecimiento:', error);
        return res.status(500).json({
            success: false,
            message: 'Error al obtener el detalle del establecimiento',
            error: error instanceof Error ? error.message : 'Error desconocido'
        });
    }
};

export default getDetalleEstablecimiento; 