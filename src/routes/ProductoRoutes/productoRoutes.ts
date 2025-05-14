import express from 'express';
import listProductos from '../../controllers/ProductoController/listProductoController';
import getProductoById from '../../controllers/ProductoController/getProductoByIdController';

const router = express.Router();

router.get('/list', listProductos);
router.get('/:id', getProductoById);

export default router; 