import { Request, Response } from 'express';
import EventoService from '../../services/EventoService/eventoService';

const eliminarPatrocinador = async (req: Request, res: Response) => {
    try {
        const { id_patrocinador_evento } = req.params;
        const resultado = await EventoService.eliminarPatrocinador(Number(id_patrocinador_evento));
        if (!resultado.success) {
            return res.status(400).json({ status: 'Error', message: resultado.message });
        }
        res.status(200).json({ status: 'Éxito', message: 'Patrocinador eliminado correctamente' });
    } catch (error: any) {
        res.status(500).json({ status: 'Error', message: error.message || 'Error interno del servidor' });
    }
};

export default eliminarPatrocinador; 