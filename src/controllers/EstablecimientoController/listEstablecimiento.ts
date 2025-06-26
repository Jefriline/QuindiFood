import { Request, Response } from 'express';
import ListEstablecimientoService from '../../services/EstablecimientoService/listEstablecimientoService';

const listEstablecimientos = async (req: Request, res: Response) => {
    try {
        // Obtener el parámetro de estado desde query params
        const estado = req.query.estado as string;
        
        // Validar que el estado sea válido si se proporciona
        if (estado && !['Pendiente', 'Aprobado', 'Rechazado', 'Suspendido'].includes(estado)) {
            return res.status(400).json({
                success: false,
                message: 'Estado inválido. Valores permitidos: Pendiente, Aprobado, Rechazado, Suspendido'
            });
        }

        const establecimientos = await ListEstablecimientoService.getAll(estado);
        return res.status(200).json({
            success: true,
            message: "Establecimientos obtenidos exitosamente",
            data: establecimientos
        });
    } catch (error: any) {
        console.error('Error al listar establecimientos:', error);
        return res.status(500).json({
            success: false,
            message: 'Error al obtener establecimientos',
            error: error?.message || error?.toString() || 'Error desconocido'
        });
    }
};

export default listEstablecimientos; 