import { Request, Response } from 'express';
import EventoService from '../../services/EventoService/eventoService';

const eliminarEvento = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const resultado = await EventoService.eliminarEvento(Number(id));
        
        if (!resultado.success) {
            return res.status(400).json({ 
                status: 'Error', 
                message: resultado.message 
            });
        }

        res.status(200).json({ 
            status: 'Éxito', 
            message: 'Evento eliminado exitosamente' 
        });
    } catch (error: any) {
        console.error('Error al eliminar evento:', error);
        res.status(500).json({ 
            status: 'Error', 
            message: error.message || 'Error interno del servidor' 
        });
    }
};

export default eliminarEvento; 