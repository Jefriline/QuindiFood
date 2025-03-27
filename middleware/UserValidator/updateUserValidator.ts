import { check, param, validationResult } from 'express-validator';
import { NextFunction, Request, Response } from "express";

const validatorUpdateUser = [
    param('id')
    .isInt()
    .withMessage('El ID debe ser un número entero'),
    
    check('nombre')
        .optional()
        .isLength({ min: 3, max: 100 })
        .withMessage('El nombre debe tener entre 3 y 100 caracteres.')
        .matches(/^[A-Za-zÁáÉéÍíÓóÚúÑñ\s]+$/)
        .withMessage('El nombre solo puede contener letras y espacios.'),

    check('email')
        .optional()
        .isEmail()
        .withMessage('Debe ser un email válido.')
        .isLength({ max: 320 })
        .withMessage('El email no puede tener más de 320 caracteres.'),

    check('contraseña')
        .optional()
        .isLength({ min: 6 })
        .withMessage('La contraseña debe tener al menos 6 caracteres.')
        .matches(/[A-Z]/)
        .withMessage('La contraseña debe contener al menos una letra mayúscula.')
        .matches(/[a-z]/)
        .withMessage('La contraseña debe contener al menos una letra minúscula.')
        .matches(/\d/)
        .withMessage('La contraseña debe contener al menos un número.'),

    check('descripcion')
        .optional()
        .isLength({ max: 250 })
        .withMessage('La descripción no puede tener más de 250 caracteres.'),

    check('foto_perfil')
        .optional()
        .isString()
        .withMessage('La foto de perfil debe ser una cadena de texto.')
];

function validator(req: Request, res: Response, next: NextFunction) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }
    next();
}

export default {
    validatorUpdateUser,
    validator
}; 