import express from 'express';
import registerEstablecimiento from '../../controllers/EstablecimientoController/registerEstablecimiento';
import listEstablecimientos from '../../controllers/EstablecimientoController/listEstablecimiento';
import getDetalleEstablecimiento from '../../controllers/EstablecimientoController/detalleEstablecimiento';
import establecimientoValidator from '../../middleware/EstablecimientoValidator/establecimientoValidator';

const router = express.Router();

// Ruta para registrar establecimiento
router.post('/register', establecimientoValidator.establecimientoValidatorParams, establecimientoValidator.validator, registerEstablecimiento);

// Ruta para listar establecimientos
router.get('/list', listEstablecimientos);

// Ruta para obtener detalle de un establecimiento
router.get('/:id', getDetalleEstablecimiento);

export default router; 