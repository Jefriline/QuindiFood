import express from 'express';
import dotenv from 'dotenv';

dotenv.config();


const app = express();
const PORT = process.env.PORT || 10101;


app.get('/', (req, res) => {
  res.send('¡QuindiFood está funcionando! ');
});


app.listen(PORT, () => {
  console.log(`Servidor activo en http://localhost:${PORT}`);
});