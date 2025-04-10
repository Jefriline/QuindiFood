import express from 'express';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import { Pool } from 'pg';

import userRoutes from './routes/UserRoutes/userRoutes';
import establecimientoRoutes from './routes/EstablecimientoRoutes/establecimientoRoutes';
import { createImageRoutes } from './routes/ImageRoutes/imageRoutes';
import { createEventRoutes } from './routes/EventRoutes/eventRoutes';

import { ImageController } from './controllers/ImageController/imageController';
import { EventController } from './controllers/EventController/eventController';
import { ImageService } from './services/ImageService/imageService';
import { EventService } from './services/EventService/eventService';
import { ImageRepository } from './repositories/ImageRepository/imageRepository';
import { EventRepository } from './repositories/EventRepository/eventRepository';

dotenv.config();

const app = express();
app.use(bodyParser.json());

// Database connection
const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

// Initialize repositories
const imageRepository = new ImageRepository(pool);
const eventRepository = new EventRepository(pool);

// Initialize services
const imageService = new ImageService(imageRepository);
const eventService = new EventService(eventRepository);

// Initialize controllers
const imageController = new ImageController(imageService);
const eventController = new EventController(eventService);

app.get('/', (req, res) => {
  res.send('¡QuindiFood está funcionando! ');
});

// routes
app.use('/user', userRoutes);
app.use('/establecimiento', establecimientoRoutes);
app.use('/api/images', createImageRoutes(imageController));
app.use('/api/eventos', createEventRoutes(eventController));

const PORT = process.env.PORT || 10101;

app.listen(PORT, () => {
  console.log("Servidor ejecutándose en el puerto: ", PORT);
}).on("error", (error) => {
  throw new Error(error.message);
});