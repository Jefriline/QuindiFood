import { Request, Response } from 'express';
import EventoService from '../../services/EventoService/eventoService';

const listarEventosPublico = async (req: Request, res: Response) => {
    try {
        const eventos = await EventoService.listarEventosPublico();
        res.status(200).json(eventos);
    } catch (error: any) {
        res.status(500).json({ status: 'Error', message: error.message || 'Error interno del servidor' });
    }
};

export default listarEventosPublico; 