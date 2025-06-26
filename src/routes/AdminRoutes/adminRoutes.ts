import express from 'express';
import aprobarEstablecimiento from '../../controllers/EstablecimientoController/aprobarEstablecimientoController';
import rechazarEstablecimiento from '../../controllers/EstablecimientoController/rechazarEstablecimientoController';
// import listarSolicitudesPendientes from '../../controllers/EstablecimientoController/listarSolicitudesPendientesController';
import verifyToken from '../../middleware/UserValidator/verifyToken';
import verifyRole from '../../middleware/UserValidator/verifyRole';
import suspenderEstablecimiento from '../../controllers/EstablecimientoController/suspenderEstablecimientoController';
import getDashboardStats from '../../controllers/EstablecimientoController/dashboardStatsController';
import getDashboardActivities from '../../controllers/EstablecimientoController/dashboardActivitiesController';

const router = express.Router();

// Rutas de administración de establecimientos
// Usar la ruta existente: GET /establecimiento/list?estado=Pendiente
// router.get('/solicitudes-establecimientos', verifyToken, verifyRole(['ADMIN']), listarSolicitudesPendientes);
router.put('/solicitudes-establecimientos/:id/approve', verifyToken, verifyRole(['ADMIN']), aprobarEstablecimiento);
router.put('/solicitudes-establecimientos/:id/reject', verifyToken, verifyRole(['ADMIN']), rechazarEstablecimiento);
router.put('/suspender-establecimiento/:id', verifyToken, verifyRole(['ADMIN']), suspenderEstablecimiento);

// Rutas para el dashboard - Frontend espera /api/admin/dashboard/*
router.get('/dashboard/stats', verifyToken, verifyRole(['ADMIN']), getDashboardStats);
router.get('/dashboard/activities', verifyToken, verifyRole(['ADMIN']), getDashboardActivities);

export default router; 