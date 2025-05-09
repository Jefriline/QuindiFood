import { Request, Response, NextFunction } from 'express';
import { check, validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';

const validatorUpdateUser = [
    check('nombre')
        .exists().withMessage('El nombre es requerido')
        .notEmpty().withMessage('El nombre no puede estar vacío')
        .isString().withMessage('El nombre debe ser texto')
        .isLength({ min: 3, max: 100 }).withMessage('El nombre debe tener entre 3 y 100 caracteres'),

    check('email')
        .exists().withMessage('El email es requerido')
        .notEmpty().withMessage('El email no puede estar vacío')
        .isEmail().withMessage('Debe ser un email válido')
        .isLength({ max: 320 }).withMessage('El email no puede exceder 320 caracteres'),

        check('contraseña')
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
        .isString().withMessage('La descripción debe ser texto')
        .isLength({ max: 250 }).withMessage('La descripción no puede exceder 250 caracteres'),

    check('foto_perfil')
        .optional()
        .isString()
        .withMessage('La foto de perfil debe ser una cadena de texto.')
];

const validator = (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            status: 'Error',
            message: 'Error de validación',
            errors: errors.array()
        });
    }
    next();
};

// Middleware para extraer el ID del usuario desde el token
const extractUserIdFromToken = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ message: 'Token no proporcionado' });
    }

    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, process.env.KEY_TOKEN as string) as { id: number };
        req.body.id = decoded.id; // Añadimos el ID al cuerpo de la solicitud
        next();
    } catch (error) {
        return res.status(403).json({ message: 'Token inválido' });
    }
};

export default {
    validatorUpdateUser,
    validator,
    extractUserIdFromToken
}; 