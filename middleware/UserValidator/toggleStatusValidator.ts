import { Request, Response, NextFunction } from 'express';
import { query, validationResult } from 'express-validator';

const validatorToggleStatus = [
    query('estado')
        .notEmpty()
        .withMessage('El estado es requerido')
        .isIn(['Activo', 'Inactivo'])
        .withMessage('El estado debe ser "Activo" o "Inactivo"')
];

const validator = (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: errors.array()[0].msg
        });
    }
    next();
};

export default {
    validatorToggleStatus,
    validator
}; 