import express from 'express';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import cors from 'cors';

import userRoutes from './routes/UserRoutes/userRoutes';
import establecimientoRoutes from './routes/EstablecimientoRoutes/establecimientoRoutes';
import searchRoutes from './routes/SearchRoutes/searchRoutes';

dotenv.config();

const app = express().use(bodyParser.json());
const corsOptions = {
  origin: '*', // Permite todas las origenes
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

app.use(cors(corsOptions));


app.get('/', (req, res) => {
  res.send('¡QuindiFood está funcionando! ');
});

// routes
app.use('/user', userRoutes);



app.use('/establecimiento', establecimientoRoutes);

app.use('/search', searchRoutes);

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Servidor corriendo en el puerto ${port}`);
}).on("error", (error) => {
  throw new Error(error.message);
});