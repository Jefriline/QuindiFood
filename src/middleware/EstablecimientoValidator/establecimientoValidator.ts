import { param, check, validationResult } from 'express-validator';
import { NextFunction, Request, Response } from "express";

let establecimientoValidatorParams = [
    check('nombre')
        .isLength({ min: 3, max: 30 })
        .withMessage('El nombre del establecimiento debe tener entre 3 y 30 caracteres.')
        .trim()
        .notEmpty()
        .withMessage('El nombre no puede estar vacío'),

    check('ubicacion')
        .isLength({ min: 10, max: 200 })
        .withMessage('La ubicación debe tener entre 10 y 200 caracteres.')
        .trim()
        .notEmpty()
        .withMessage('La ubicación no puede estar vacía'),

    check('telefono')
        .optional()
        .isLength({ min: 10, max: 10 })
        .withMessage('El teléfono debe tener exactamente 10 dígitos.')
        .matches(/^[0-9]+$/)
        .withMessage('El teléfono solo puede contener números.'),

    check('descripcion')
        .optional()
        .isLength({ min: 10, max: 200 })
        .withMessage('La descripción debe tener entre 10 y 200 caracteres.'),

    check('contactos')
        .optional()
        .isArray()
        .withMessage('Los contactos deben ser un array.')
        .custom((value) => {
            if (value && value.length > 0) {
                for (const url of value) {
                    if (!url.match(/^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/)) {
                        throw new Error('URL inválida en los contactos');
                    }
                }
            }
            return true;
        }),

    check('registro_mercantil')
        .notEmpty()
        .withMessage('El registro mercantil es obligatorio.'),

    check('rut')
        .notEmpty()
        .withMessage('El RUT es obligatorio.'),

    check('certificado_salud')
        .notEmpty()
        .withMessage('El certificado de salud es obligatorio.')
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
    validator
}; 