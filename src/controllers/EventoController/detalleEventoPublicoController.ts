import { Request, Response } from 'express';
import EventoService from '../../services/EventoService/eventoService';

const detalleEventoPublico = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const evento = await EventoService.detalleEventoPublico(Number(id));
        if (!evento) {
            return res.status(404).json({ status: 'Error', message: 'Evento no encontrado' });
        }
        res.status(200).json(evento);
    } catch (error: any) {
        res.status(500).json({ status: 'Error', message: error.message || 'Error interno del servidor' });
    }
};

export default detalleEventoPublico; 