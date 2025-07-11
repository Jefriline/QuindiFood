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
import aiRoutes from './routes/AIRoutes/aiRoutes'; // Comentado temporalmente
import estadisticasRoutes from './routes/EstadisticasRoutes/estadisticasRoutes';
import { WorkerManager } from './workers/workerManager';
import mercadoPagoWebhook from './controllers/WebhookController/mercadoPagoWebhook';
dotenv.config();

const app = express().use(bodyParser.json());
const corsOptions = {
  origin: '*', // Permite todas las origenes
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cache-Control'],
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
app.use('/ai', aiRoutes);
app.use('/estadisticas', estadisticasRoutes);
app.post('/webhook/mercadopago', mercadoPagoWebhook);

// Endpoint temporal para activar manualmente membresía
app.post('/admin/activar-membresia/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { paymentId } = req.body;
        
        console.log(`🔧 Activación manual de membresía para establecimiento ${id} con payment ${paymentId || 'manual'}`);
        
        const EstablecimientoService = (await import('./services/EstablecimientoService/establecimientoService')).default;
        
        const resultado = await EstablecimientoService.activarMembresiaPorPago(
            parseInt(id), 
            paymentId || 'manual_activation'
        );
        
        res.json({
            success: true,
            message: 'Membresía activada manualmente',
            data: resultado
        });
    } catch (error: any) {
        console.error('Error activando membresía manualmente:', error);
        res.status(500).json({
            success: false,
            message: 'Error al activar membresía',
            error: error.message
        });
    }
});

const port = process.env.PORT || 10101;

app.listen(port, async () => {
  console.log(`Servidor corriendo en el puerto ${port}`);
  
  // Inicializar workers después de que el servidor esté listo
  try {
    await WorkerManager.initialize();
    console.log('🎉 Sistema completo iniciado exitosamente');
  } catch (error) {
    console.error('❌ Error inicializando workers:', error);
    // El servidor puede continuar funcionando sin workers si es necesario
  }
}).on("error", (error) => {
  throw new Error(error.message);
});
//
export default app;