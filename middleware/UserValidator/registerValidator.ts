import { check, validationResult } from 'express-validator';
import { NextFunction, Request, Response } from "express";

const validatorRegister = [
    check('nombre')
        .isLength({ min: 3, max: 100 })
        .withMessage('El nombre debe tener entre 3 y 100 caracteres.')
        .matches(/^[A-Za-zÁáÉéÍíÓóÚúÑñ\s]+$/)
        .withMessage('El nombre solo puede contener letras y espacios.'),

    check('email')
        .isEmail()
        .withMessage('Debe ser un email válido.')
        .isLength({ max: 320 })
        .withMessage('El email no puede tener más de 320 caracteres.'),

    check('contraseña')
        .isLength({ min: 6 })
        .withMessage('La contraseña debe tener al menos 6 caracteres.')
        .matches(/[A-Z]/)
        .withMessage('La contraseña debe contener al menos una letra mayúscula.')
        .matches(/[a-z]/)
        .withMessage('La contraseña debe contener al menos una letra minúscula.')
        .matches(/\d/)
        .withMessage('La contraseña debe contener al menos un número.')
];

function validator(req: Request, res: Response, next: NextFunction) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }
    next();
}

export default {
    validatorRegister,
    validator
}; 