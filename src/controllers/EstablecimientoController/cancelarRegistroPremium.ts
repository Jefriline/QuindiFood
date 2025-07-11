import { Request, Response } from 'express';
import EstablecimientoService from '../../services/EstablecimientoService/establecimientoService';

const cancelarRegistroPremium = async (req: Request, res: Response) => {
    try {
        // Obtener el ID del usuario autenticado
        const FK_id_usuario = (req as any).user?.id;
        if (!FK_id_usuario) {
            return res.status(400).json({
                success: false,
                message: 'No se pudo identificar al usuario.'
            });
        }

        console.log('🗑️ Cancelando registro premium para usuario:', FK_id_usuario);

        // Buscar el establecimiento más reciente del usuario con estado "Pendiente de Pago"
        const resultado = await EstablecimientoService.cancelarRegistroPendiente(FK_id_usuario);

        if (resultado.success) {
            console.log('✅ Registro premium cancelado exitosamente');
            return res.status(200).json({
                success: true,
                message: 'Registro premium cancelado exitosamente. Puedes intentar registrar un plan gratuito si lo deseas.',
                data: {
                    establecimiento_eliminado: resultado.data?.nombre_establecimiento || 'Sin nombre',
                    archivos_eliminados: resultado.data?.archivos_eliminados || 0
                }
            });
        } else {
            console.log('⚠️ No se encontró registro pendiente para cancelar');
            return res.status(404).json({
                success: false,
                message: 'No se encontró ningún registro premium pendiente para cancelar.'
            });
        }

    } catch (error) {
        console.error('❌ Error cancelando registro premium:', error);
        return res.status(500).json({
            success: false,
            message: 'Error interno del servidor al cancelar el registro.',
            error: error instanceof Error ? error.message : 'Error desconocido'
        });
    }
};

export default cancelarRegistroPremium; 