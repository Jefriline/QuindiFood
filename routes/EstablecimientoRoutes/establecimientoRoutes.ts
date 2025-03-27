import express from 'express';
import registerEstablecimiento from '../../controllers/EstablecimientoController/registerEstablecimiento';
import listEstablecimientos from '../../controllers/EstablecimientoController/listEstablecimiento';
import getDetalleEstablecimiento from '../../controllers/EstablecimientoController/detalleEstablecimiento';
import establecimientoValidator from '../../middleware/EstablecimientoValidator/establecimientoValidator';
import addFavorito from '../../controllers/FavoritosController/addFavorito';
import { verifyToken } from '../../middleware/verifyToken/verifyToken';
import searchEstablecimiento from '../../controllers/EstablecimientoController/searchEstablecimiento';

const router = express.Router();

// Ruta para registrar establecimiento
router.post('/register', establecimientoValidator.establecimientoValidatorParams, establecimientoValidator.validator, registerEstablecimiento);

// Ruta para listar establecimientos
router.get('/list', listEstablecimientos);

// Ruta para buscar establecimientos por nombre
router.get('/search', searchEstablecimiento);

// Ruta para obtener detalle de un establecimiento
router.get('/:id', getDetalleEstablecimiento);

// Ruta para agregar a favoritos
router.post('/:id/favoritos', verifyToken, addFavorito);

export default router; 