import { Request, Response, NextFunction } from "express";
import { param, validationResult } from "express-validator";

const validatorGetUserById = [
    param('id')
        .isInt({ min: 1 })
        .withMessage('El ID debe ser un número entero positivo')
];

const validator = (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ 
            status: 'Error',
            errors: errors.array() 
        });
    }
    next();
};

export default {
    validatorGetUserById,
    validator
}; 