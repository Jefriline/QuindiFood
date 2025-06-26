import { param, check, validationResult } from 'express-validator';
import { NextFunction, Request, Response } from "express";
import multer from 'multer';

// Middleware para subir archivos
export const uploadEstablecimiento = multer({
    storage: multer.memoryStorage(),
    limits: { 
        fileSize: 20 * 1024 * 1024, // 20MB por archivo
        files: 10 // Máximo 10 archivos (fotos + documentos)
    },
    fileFilter: (req, file, cb) => {
        // Para documentos (PDF)
        if (file.fieldname.startsWith('documento_')) {
            if (file.mimetype === 'application/pdf') {
                cb(null, true);
            } else {
                cb(new Error('Los documentos deben ser archivos PDF'));
            }
        }
        // Para fotos (imágenes)
        else if (file.fieldname.startsWith('foto_')) {
            if (file.mimetype.startsWith('image/')) {
                cb(null, true);
            } else {
                cb(new Error('Las fotos deben ser archivos de imagen'));
            }
        }
        else {
            cb(new Error('Tipo de archivo no permitido'));
        }
    }
}).fields([
    { name: 'documento_registro_mercantil', maxCount: 1 },
    { name: 'documento_rut', maxCount: 1 },
    { name: 'documento_certificado_salud', maxCount: 1 },
    { name: 'documento_registro_invima', maxCount: 1 },
    { name: 'foto_establecimiento', maxCount: 10 } // Múltiples fotos
]);

let establecimientoValidatorParams = [
    check('nombre_establecimiento')
        .isLength({ min: 3, max: 30 })
        .withMessage('El nombre del establecimiento debe tener entre 3 y 30 caracteres.')
        .trim()
        .notEmpty()
        .withMessage('El nombre no puede estar vacío'),

    check('ubicacion')
        .isLength({ min: 10, max: 500 })
        .withMessage('La ubicación debe tener entre 10 y 500 caracteres.')
        .trim()
        .notEmpty()
        .withMessage('La ubicación no puede estar vacía'),

    check('telefono')
        .optional()
        .isLength({ min: 7, max: 15 })
        .withMessage('El teléfono debe tener entre 7 y 15 caracteres.')
        .matches(/^[0-9+\-\s()]+$/)
        .withMessage('El teléfono solo puede contener números, espacios, guiones y paréntesis.'),

    check('contacto')
        .optional()
        .isLength({ min: 5, max: 200 })
        .withMessage('El contacto debe tener entre 5 y 200 caracteres.')
        .isEmail()
        .withMessage('El contacto debe ser un email válido.'),

    check('descripcion')
        .optional()
        .isLength({ min: 10, max: 200 })
        .withMessage('La descripción debe tener entre 10 y 200 caracteres.'),

    check('FK_id_categoria_estab')
        .isInt({ min: 1 })
        .withMessage('La categoría del establecimiento es obligatoria y debe ser un número válido.')
];

let idValidator = [
    param('id')
        .isInt({ min: 1 })
        .withMessage('El id debe ser un número entero positivo.')
        .isLength({ max: 4 })
        .withMessage('El id no puede tener más de 4 dígitos.')
];

function validator(req: Request, res: Response, next: NextFunction) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }
    next();
}

export default {
    establecimientoValidatorParams,
    idValidator,
    validator,
    uploadEstablecimiento
}; 