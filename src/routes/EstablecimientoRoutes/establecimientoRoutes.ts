import express from 'express';
import registerEstablecimiento from '../../controllers/EstablecimientoController/registerEstablecimiento';
import listEstablecimientos from '../../controllers/EstablecimientoController/listEstablecimiento';
import getDetalleEstablecimiento from '../../controllers/EstablecimientoController/detalleEstablecimiento';

import establecimientoValidator from '../../middleware/EstablecimientoValidator/establecimientoValidator';
import getEstablecimientoById from '../../controllers/EstablecimientoController/getEstablecimientoByIdController';
import getEstadoEstablecimiento from '../../controllers/EstablecimientoController/getEstadoEstablecimientoController';

const router = express.Router();

// Ruta para registrar establecimiento
// router.post('/register', establecimientoValidator.establecimientoValidatorParams, establecimientoValidator.validator, registerEstablecimiento);


// Ruta para obtener establecimientos completos
router.get('/list', listEstablecimientos);

// Ruta para obtener detalle de un establecimiento
// router.get('/detalle/:id', getDetalleEstablecimiento);

router.get('/:id', getEstablecimientoById);
router.get('/disponibilidad/:id', getEstadoEstablecimiento);

export default router; 