import express from 'express';
import verifyToken from '../../middleware/UserValidator/verifyToken';
import { onlyPropietario } from '../../middleware/UserValidator/onlyPropietario';
import {
    getDashboardEstadisticas,
    exportarEstadisticas,
    getEstadisticasRapidas,
    getActividadRecienteFeed
} from '../../controllers/EstadisticasController/estadisticasController';
import {
    validarDashboardEstadisticas,
    validarExportarEstadisticas,
    validarEstadisticasRapidas,
    validarActividadReciente,
    verificarPropietario
} from '../../middleware/EstadisticasValidator/estadisticasValidator';

const router = express.Router();

// =======================
// RUTAS PRINCIPALES DE ESTADÍSTICAS
// =======================

/**
 * @route GET /api/estadisticas/dashboard
 * @desc Obtener dashboard completo de estadísticas para propietario
 * @access Private (Solo PROPIETARIO)
 * @query {string} [fecha_inicio] - Fecha de inicio en formato YYYY-MM-DD
 * @query {string} [fecha_fin] - Fecha de fin en formato YYYY-MM-DD
 * @query {string} [tipo_periodo=mes] - Tipo de período: dia, semana, mes, trimestre, año
 * @query {string} [tipos_actividad] - Lista de tipos separados por comas
 */
router.get(
    '/dashboard',
    verifyToken,
    onlyPropietario,
    validarDashboardEstadisticas,
    getDashboardEstadisticas
);

/**
 * @route GET /api/estadisticas/exportar
 * @desc Exportar estadísticas detalladas en formato JSON
 * @access Private (Solo PROPIETARIO)
 * @query {string} [fecha_inicio] - Fecha de inicio
 * @query {string} [fecha_fin] - Fecha de fin (máximo 6 meses de rango)
 * @query {string} [tipo_periodo=mes] - Tipo de período para el export
 */
router.get(
    '/exportar',
    verifyToken,
    onlyPropietario,
    validarExportarEstadisticas,
    exportarEstadisticas
);

/**
 * @route GET /api/estadisticas/rapidas
 * @desc Estadísticas rápidas para el propietario (KPIs básicos)
 * @access Private (Solo PROPIETARIO)
 */
router.get(
    '/rapidas',
    verifyToken,
    onlyPropietario,
    validarEstadisticasRapidas,
    getEstadisticasRapidas
);

/**
 * @route GET /api/estadisticas/actividad-feed
 * @desc Feed de actividad reciente del establecimiento (clics, favoritos, comentarios, puntuaciones)
 * @access Private (Solo PROPIETARIO)
 */
router.get(
    '/actividad-feed',
    verifyToken,
    onlyPropietario,
    getActividadRecienteFeed
);

export default router; 