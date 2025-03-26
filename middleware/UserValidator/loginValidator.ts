import { check, validationResult } from 'express-validator';
import { NextFunction, Request, Response } from "express";

const validatorLogin = [
    check('email')
        .isEmail()
        .withMessage('Debe ser un email válido.')
        .isLength({ max: 320 })
        .withMessage('El email no puede tener más de 320 caracteres.'),

    check('contraseña')
        .not()
        .isEmpty()
        .withMessage('La contraseña es requerida.')
];

function validator(req: Request, res: Response, next: NextFunction) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }
    next();
}

export default {
    validatorLogin,
    validator
}; 