import { Request, Response } from 'express';
import { EventService } from '../../services/EventService/eventService';

export class EventController {
    constructor(private eventService: EventService) {}

    getAllEvents = async (req: Request, res: Response): Promise<void> => {
        try {
            const events = await this.eventService.getAllEvents();
            res.status(200).json(events);
        } catch (error) {
            res.status(500).json({ message: 'Error al obtener eventos', error });
        }
    };

    getEventById = async (req: Request, res: Response): Promise<void> => {
        try {
            const id = parseInt(req.params.id);
            const event = await this.eventService.getEventById(id);
            if (event) {
                res.status(200).json(event);
            } else {
                res.status(404).json({ message: 'Evento no encontrado' });
            }
        } catch (error) {
            res.status(500).json({ message: 'Error al obtener el evento', error });
        }
    };

    createEvent = async (req: Request, res: Response): Promise<void> => {
        try {
            const newEvent = await this.eventService.createEvent(req.body);
            res.status(201).json(newEvent);
        } catch (error) {
            res.status(500).json({ message: 'Error al crear el evento', error });
        }
    };

    updateEvent = async (req: Request, res: Response): Promise<void> => {
        try {
            const id = parseInt(req.params.id);
            const updatedEvent = await this.eventService.updateEvent(id, req.body);
            if (updatedEvent) {
                res.status(200).json(updatedEvent);
            } else {
                res.status(404).json({ message: 'Evento no encontrado' });
            }
        } catch (error) {
            res.status(500).json({ message: 'Error al actualizar el evento', error });
        }
    };

    deleteEvent = async (req: Request, res: Response): Promise<void> => {
        try {
            const id = parseInt(req.params.id);
            const success = await this.eventService.deleteEvent(id);
            if (success) {
                res.status(200).json({ message: 'Evento eliminado correctamente' });
            } else {
                res.status(404).json({ message: 'Evento no encontrado' });
            }
        } catch (error) {
            res.status(500).json({ message: 'Error al eliminar el evento', error });
        }
    };
} 