import express from 'express';
import multer from 'multer';
import registerEstablecimiento from '../../controllers/EstablecimientoController/registerEstablecimiento';
import listEstablecimientos from '../../controllers/EstablecimientoController/listEstablecimiento';
import getDetalleEstablecimiento from '../../controllers/EstablecimientoController/detalleEstablecimiento';

import establecimientoValidator, { uploadEstablecimiento } from '../../middleware/EstablecimientoValidator/establecimientoValidator';
import getEstablecimientoById from '../../controllers/EstablecimientoController/getEstablecimientoByIdController';
import getEstadoEstablecimiento from '../../controllers/EstablecimientoController/getEstadoEstablecimientoController';
import verifyToken from '../../middleware/UserValidator/verifyToken';
import { onlyCliente } from '../../middleware/UserValidator/onlyCliente';
import verifyRole from '../../middleware/UserValidator/verifyRole';
import eliminarEstablecimientoAdmin from '../../controllers/EstablecimientoController/eliminarEstablecimientoAdminController';
import eliminarEstablecimientoPropietario from '../../controllers/EstablecimientoController/eliminarEstablecimientoPropietarioController';
import getMiEstablecimiento from '../../controllers/EstablecimientoController/getMiEstablecimientoController';
import getEstadoEstablecimientoUsuario from '../../controllers/EstablecimientoController/getEstadoEstablecimientoUsuarioController';
import editarEstablecimiento from '../../controllers/EstablecimientoController/editarEstablecimientoController_new';
import verifyUserId from '../../middleware/UserValidator/verifyUserId';
import { onlyPropietario } from '../../middleware/UserValidator/onlyPropietario';
import { Request, Response, NextFunction } from 'express';
import simpleUserId from '../../middleware/UserValidator/simpleUserId';
import { trackEstablecimientoAccess } from '../../middleware/ActivityTracker/activityTrackerMiddleware';
import simpleUserIdOptional from '../../middleware/UserValidator/simpleUserIdOptional';

const router = express.Router();

// Configurar multer para editar establecimiento
const uploadEditarEstablecimiento = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB por archivo
        files: 15 // Máximo 15 archivos
    },
    fileFilter: (req, file, cb) => {
        // Permitir imágenes para fotos y PDFs/imágenes para documentos
        if (file.fieldname === 'fotos') {
            const allowedTypes = /jpeg|jpg|png|gif|webp/;
            const extname = allowedTypes.test(file.originalname.toLowerCase());
            const mimetype = file.mimetype.startsWith('image/');
            
            if (mimetype && extname) {
                return cb(null, true);
            } else {
                return cb(new Error('Las fotos deben ser archivos de imagen'));
            }
        } else if (file.fieldname.startsWith('documentacion[') && file.fieldname.endsWith(']')) {
            const allowedTypes = /pdf|jpeg|jpg|png|gif|webp/;
            const extname = allowedTypes.test(file.originalname.toLowerCase());
            const mimetype = file.mimetype === 'application/pdf' || file.mimetype.startsWith('image/');
            
            if (mimetype && extname) {
                return cb(null, true);
            } else {
                return cb(new Error('Los documentos deben ser PDF o imágenes'));
            }
        } else {
            return cb(new Error('Campo no permitido'));
        }
    }
});

// Ruta para registrar establecimiento con upload de archivos
router.post('/register', 
    verifyToken,
    onlyCliente,
    uploadEstablecimiento,
    establecimientoValidator.establecimientoValidatorParams, 
    establecimientoValidator.validator, 
    registerEstablecimiento
);

// Ruta para obtener establecimientos completos
router.get('/list', listEstablecimientos);

// Obtener mi establecimiento - DEBE IR ANTES DE /:id
router.get('/mi-establecimiento', 
    verifyToken, 
    simpleUserId,
    getMiEstablecimiento
);

// Verificar estado de establecimiento del usuario autenticado
router.get('/estado-establecimiento', 
    verifyToken, 
    simpleUserId,
    getEstadoEstablecimientoUsuario
);

// Estas rutas específicas ANTES de /:id
router.get('/disponibilidad/:id', getEstadoEstablecimiento);

// Ruta genérica /:id DEBE IR AL FINAL (con tracking de actividad)
router.get('/:id', simpleUserIdOptional, trackEstablecimientoAccess, getEstablecimientoById);

// Ruta para obtener detalle de un establecimiento
// router.get('/detalle/:id', getDetalleEstablecimiento);

// Editar establecimiento - acepta cualquier campo de archivo
router.put('/editar/establecimiento', verifyToken, simpleUserId, onlyPropietario, uploadEditarEstablecimiento.any(), editarEstablecimiento);

// Eliminar establecimiento (admin)
router.delete('/eliminar/establecimiento/:id', verifyToken, verifyRole(['ADMIN']), eliminarEstablecimientoAdmin);
// Eliminar establecimiento (propietario)
router.delete('/eliminar/mi-establecimiento/:id', verifyToken, eliminarEstablecimientoPropietario);

export default router; 