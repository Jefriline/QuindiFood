import { Request, Response } from 'express';
import EstablecimientoService from '../../services/EstablecimientoService/establecimientoService';
import { ListEstablecimientoDto } from '../../Dto/EstablecimientoDto/listEstablecimientoDto';

const listarSolicitudesPendientes = async (req: Request, res: Response) => {
    try {
        const solicitudes = await EstablecimientoService.getSolicitudesPendientes();

        // Mapear a DTO y aplicar toJSON automáticamente
        const data = solicitudes.map((row: any) => {
            const dto = new ListEstablecimientoDto(
                row.id_establecimiento,
                row.nombre_establecimiento,
                row.descripcion,
                row.ubicacion,
                row.categoria,
                row.imagenes,
                row.estado_membresia || 'Inactivo',
                row.promedio || 0,
                row.horarios || [],
                row.estado_establecimiento || row.estado || 'Pendiente',
                row.fk_id_usuario || row.FK_id_usuario || 0,
                row.documentos || row.documentacion || {}
            );
            return dto.toJSON();
        });

        return res.status(200).json({
            success: true,
            message: 'Establecimientos obtenidos exitosamente',
            data
        });
    } catch (error: any) {
        console.error('Error al listar solicitudes pendientes:', error);
        return res.status(500).json({
            success: false,
            message: 'Error al obtener las solicitudes pendientes',
            error: error?.message || 'Error desconocido'
        });
    }
};

export default listarSolicitudesPendientes; 