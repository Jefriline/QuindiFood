import { Request, Response } from 'express';
import EstablecimientoService from '../../services/EstablecimientoService/establecimientoService';

const getEstadoEstablecimientoUsuario = async (req: Request, res: Response) => {
    try {
        // Extraer ID del usuario del token (ya validado por middleware)
        const idUsuario = (req as any).user?.id;
        
        // Validación adicional por seguridad
        if (!idUsuario || typeof idUsuario !== 'number' || idUsuario <= 0) {
            return res.status(400).json({
                success: false,
                message: 'ID de usuario inválido'
            });
        }

        const estadoEstablecimiento = await EstablecimientoService.getEstadoEstablecimientoUsuario(idUsuario);
        
        return res.status(200).json({
            success: true,
            message: 'Estado de establecimiento obtenido exitosamente',
            data: estadoEstablecimiento.toJSON()
        });
        
    } catch (error: any) {
        console.error('Error al obtener estado de establecimiento del usuario:', error);
        return res.status(500).json({
            success: false,
            message: 'Error al obtener el estado del establecimiento',
            error: error?.message || 'Error desconocido'
        });
    }
};

export default getEstadoEstablecimientoUsuario; 