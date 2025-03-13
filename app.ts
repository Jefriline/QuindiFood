import express from 'express';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import userRoutes  from './routes/UserRoutes/userRoutes';

dotenv.config();


const app = express().use(bodyParser.json());



app.get('/', (req, res) => {
  res.send('¡QuindiFood está funcionando! ');
});

 // routes
app.use('/user', userRoutes);



const PORT = process.env.PORT || 10101;

app.listen(PORT, () => {
  console.log("Servidor ejecutándose en el puerto: ", PORT);
}).on("error", (error) => {
  throw new Error(error.message);
});