import express from 'express';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import cors from 'cors';

import userRoutes from './routes/UserRoutes/userRoutes';
import establecimientoRoutes from './routes/EstablecimientoRoutes/establecimientoRoutes';
import searchRoutes from './routes/SearchRoutes/searchRoutes';
import blobStorageRoute from './routes/Blob-Storage/blobStorageRoute';
import productoRoutes from './routes/ProductoRoutes/productoRoutes';
import favoritoRoutes from './routes/FavoritoRoutes/favoritoRoutes';
import comentarioRoutes from './routes/ComentarioRoutes/comentarioRoutes';
import eventoRoutes from './routes/EventoRoutes/eventoRoutes';
import adminRoutes from './routes/AdminRoutes/adminRoutes';
import promocionRoutes from './routes/PromocionRoutes/promocionRoutes';
import categoriaRoutes from './routes/CategoriaRoutes/categoriaRoutes';
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
app.use('/producto', productoRoutes);
app.use('/favorito', favoritoRoutes);
//app.use('/storage/blob', blobStorageRoute);
app.use('/comentario', comentarioRoutes);
app.use('/evento', eventoRoutes);
app.use('/admin', adminRoutes);
app.use('/promocion', promocionRoutes);
app.use('/categoria', categoriaRoutes);

const port = process.env.PORT || 10101;

app.listen(port, () => {
  console.log(`Servidor corriendo en el puerto ${port}`);
}).on("error", (error) => {
  throw new Error(error.message);
});

export default app;