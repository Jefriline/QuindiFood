import express from 'express';
import multer from 'multer';
import registerEstablecimiento from '../../controllers/EstablecimientoController/registerEstablecimiento';
import listEstablecimientos from '../../controllers/EstablecimientoController/listEstablecimiento';
import getDetalleEstablecimiento from '../../controllers/EstablecimientoController/detalleEstablecimiento';
import establecimientoValidator from '../../middleware/EstablecimientoValidator/establecimientoValidator';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Ruta para registrar establecimiento
router.post('/register', 
    upload.fields([
        { name: 'multimedia', maxCount: 5 },
        { name: 'registro_mercantil', maxCount: 1 },
        { name: 'rut', maxCount: 1 },
        { name: 'certificado_salud', maxCount: 1 },
        { name: 'registro_invima', maxCount: 1 }
    ]),
    establecimientoValidator.establecimientoValidatorParams, 
    establecimientoValidator.validator, 
    registerEstablecimiento
);

// Ruta para listar establecimientos
router.get('/list', listEstablecimientos);

// Ruta para obtener detalle de un establecimiento
router.get('/:id', getDetalleEstablecimiento);

export default router; 