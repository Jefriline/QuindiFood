import express from 'express';
import multer from 'multer';
import listProductos from '../../controllers/ProductoController/listProductoController';
import getProductoById from '../../controllers/ProductoController/getProductoByIdController';
import getProductosByIdEstablecimiento from '../../controllers/ProductoController/getProductoByEstablecimientoController';
import crearProducto from '../../controllers/ProductoController/crearProductoController';
import listarMisProductos from '../../controllers/ProductoController/listarMisProductosController';
import editarProducto from '../../controllers/ProductoController/editarProductoController';
import eliminarProducto from '../../controllers/ProductoController/eliminarProductoController';
import { 
    validarCrearProductoCompleto, 
    validarEditarProductoCompleto, 
    validarEliminarProductoCompleto,
    validarListarMisProductosCompleto 
} from '../../middleware/ProductoValidator/productoValidator';

const router = express.Router();

// Configurar multer para manejar archivos
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
        files: 10 // Máximo 10 archivos
    },
    fileFilter: (req, file, cb) => {
        // Permitir imágenes y videos
        const allowedTypes = /jpeg|jpg|png|gif|mp4|avi|mov|wmv/;
        const extname = allowedTypes.test(file.originalname.toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        
        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Solo se permiten archivos de imagen y video'));
        }
    }
});

// Rutas públicas
router.get('/list', listProductos);
router.get('/establecimiento/:id', getProductosByIdEstablecimiento);

// Rutas protegidas para propietarios - ANTES de /:id
router.post('/crear', upload.array('multimedia', 10), validarCrearProductoCompleto, crearProducto);
router.get('/mis-productos', validarListarMisProductosCompleto, listarMisProductos);
router.put('/editar/:id', upload.array('multimedia', 10), validarEditarProductoCompleto, editarProducto);
router.delete('/eliminar/:id', validarEliminarProductoCompleto, eliminarProducto);

// Ruta genérica /:id DEBE IR AL FINAL
router.get('/:id', getProductoById);

export default router; 