import { Request, Response } from 'express';
import EventoService from '../../services/EventoService/eventoService';

const eliminarParticipacion = async (req: Request, res: Response) => {
    try {
        const { id_participacion } = req.params;
        const resultado = await EventoService.eliminarParticipacionPorId(Number(id_participacion));

        if (!resultado.success) {
            return res.status(400).json({
                status: 'Error',
                message: resultado.message
            });
        }

        res.status(200).json({
            status: 'Éxito',
            message: 'Participación eliminada exitosamente'
        });
    } catch (error: any) {
        console.error('Error al eliminar participación:', error);
        res.status(500).json({
            status: 'Error',
            message: error.message || 'Error interno del servidor'
        });
    }
};

export default eliminarParticipacion; 