import express from 'express';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import userRoutes  from './routes/UserRoutes/userRoutes';
import testRoutes from './test/testRoutes';
import establecimientoRoutes from './routes/EstablecimientoRoutes/establecimientoRoutes';
import { escapeLiteral } from 'pg';

dotenv.config();

const app = express().use(bodyParser.json());

app.get('/', (req, res) => {
  res.send('¡QuindiFood está funcionando! ');
});

// routes
app.use('/user', userRoutes);
app.use('/test', testRoutes);
app.use('/establecimiento', establecimientoRoutes);

const PORT = process.env.PORT || 10101;

app.listen(PORT, () => {
  console.log("Servidor ejecutándose en el puerto: ", PORT);
}).on("error", (error) => {
  throw new Error(error.message);
});