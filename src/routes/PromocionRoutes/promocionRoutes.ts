import express from 'express';
import multer from 'multer';
import crearPromocion from '../../controllers/PromocionController/crearPromocionController';
import listarMisPromociones from '../../controllers/PromocionController/listarMisPromocionesController';
import editarPromocion from '../../controllers/PromocionController/editarPromocionController';
import eliminarPromocion from '../../controllers/PromocionController/eliminarPromocionController';
import listarPromocionesActivas from '../../controllers/PromocionController/listarPromocionesActivasController';
import detallePromocionPublica from '../../controllers/PromocionController/detallePromocionPublicaController';
import { 
    validarCrearPromocionCompleto, 
    validarEditarPromocionCompleto, 
    validarEliminarPromocionCompleto,
    validarListarMisPromocionesCompleto 
} from '../../middleware/PromocionValidator/promocionValidator';

const router = express.Router();

// Configurar multer para manejar imágenes promocionales
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
        files: 1 // Solo una imagen por promoción
    },
    fileFilter: (req, file, cb) => {
        // Permitir solo imágenes
        const allowedTypes = /jpeg|jpg|png|gif/;
        const extname = allowedTypes.test(file.originalname.toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        
        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Solo se permiten archivos de imagen (JPEG, PNG, GIF)'));
        }
    }
});

// Rutas públicas
router.get('/activas', listarPromocionesActivas);
router.get('/:id', detallePromocionPublica);

// Rutas protegidas para propietarios - ANTES de /:id
router.post('/crear', upload.single('imagen_promocional'), validarCrearPromocionCompleto, crearPromocion);
router.get('/mis-promociones', validarListarMisPromocionesCompleto, listarMisPromociones);
router.put('/editar/:id', upload.single('imagen_promocional'), validarEditarPromocionCompleto, editarPromocion);
router.delete('/eliminar/:id', validarEliminarPromocionCompleto, eliminarPromocion);

export default router; 