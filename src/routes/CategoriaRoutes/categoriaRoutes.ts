import express from 'express';
import {
    listarCategoriasEstablecimiento,
    crearCategoriaEstablecimiento,
    editarCategoriaEstablecimiento,
    eliminarCategoriaEstablecimiento
} from '../../controllers/CategoriaController/categoriaEstablecimientoController';
import {
    listarCategoriasProducto,
    crearCategoriaProducto,
    editarCategoriaProducto,
    eliminarCategoriaProducto
} from '../../controllers/CategoriaController/categoriaProductoController';
import {
    validarCrearCategoriaCompleto,
    validarEditarCategoriaCompleto,
    validarEliminarCategoriaCompleto,
    validarListarCategoriasCompleto
} from '../../middleware/CategoriaValidator/categoriaValidator';

const router = express.Router();

// ===================== RUTAS PÚBLICAS =====================
// Estas rutas son públicas para que los usuarios puedan ver las categorías disponibles
router.get('/establecimiento', validarListarCategoriasCompleto, listarCategoriasEstablecimiento);
router.get('/producto', validarListarCategoriasCompleto, listarCategoriasProducto);

// ===================== RUTAS PROTEGIDAS PARA ADMINISTRADORES =====================

// === CATEGORÍAS DE ESTABLECIMIENTO ===
router.post('/establecimiento/crear', validarCrearCategoriaCompleto, crearCategoriaEstablecimiento);
router.put('/establecimiento/editar/:id', validarEditarCategoriaCompleto, editarCategoriaEstablecimiento);
router.delete('/establecimiento/eliminar/:id', validarEliminarCategoriaCompleto, eliminarCategoriaEstablecimiento);

// === CATEGORÍAS DE PRODUCTO ===
router.post('/producto/crear', validarCrearCategoriaCompleto, crearCategoriaProducto);
router.put('/producto/editar/:id', validarEditarCategoriaCompleto, editarCategoriaProducto);
router.delete('/producto/eliminar/:id', validarEliminarCategoriaCompleto, eliminarCategoriaProducto);

export default router; 