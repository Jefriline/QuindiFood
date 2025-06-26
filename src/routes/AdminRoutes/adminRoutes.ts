import express from 'express';
import aprobarEstablecimiento from '../../controllers/EstablecimientoController/aprobarEstablecimientoController';
import rechazarEstablecimiento from '../../controllers/EstablecimientoController/rechazarEstablecimientoController';
import listarSolicitudesPendientes from '../../controllers/EstablecimientoController/listarSolicitudesPendientesController';
import verifyToken from '../../middleware/UserValidator/verifyToken';
import verifyRole from '../../middleware/UserValidator/verifyRole';
import suspenderEstablecimiento from '../../controllers/EstablecimientoController/suspenderEstablecimientoController';

const router = express.Router();



// Rutas de administración de establecimientos
// router.get('/solicitudes-establecimientos',verifyToken, verifyRole(['ADMIN']), listarSolicitudesPendientes);
router.put('/solicitudes-establecimientos/:id/approve', verifyToken, verifyRole(['ADMIN']), aprobarEstablecimiento);
router.put('/solicitudes-establecimientos/:id/reject', verifyToken, verifyRole(['ADMIN']), rechazarEstablecimiento);
router.put('/suspender-establecimiento/:id', verifyToken, verifyRole(['ADMIN']), suspenderEstablecimiento);

export default router; 