import { Router } from 'express';
import { EventController } from '../../controllers/EventController/eventController';

export const createEventRoutes = (eventController: EventController): Router => {
    const router = Router();

    // Rutas para eventos
    router.get('/', eventController.getAllEvents);
    router.get('/:id', eventController.getEventById);
    router.post('/', eventController.createEvent);
    router.put('/:id', eventController.updateEvent);
    router.delete('/:id', eventController.deleteEvent);

    return router;
}; 