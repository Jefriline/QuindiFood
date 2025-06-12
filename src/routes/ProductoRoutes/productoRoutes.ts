import express from 'express';
import listProductos from '../../controllers/ProductoController/listProductoController';
import getProductoById from '../../controllers/ProductoController/getProductoByIdController';
import getProductosByIdEstablecimiento from '../../controllers/ProductoController/getProductoByEstablecimientoController';

const router = express.Router();

router.get('/list', listProductos);
router.get('/:id', getProductoById);
router.get('/establecimiento/:id', getProductosByIdEstablecimiento);

export default router; 