import { Request, Response, NextFunction } from "express";
import { param, validationResult } from "express-validator";

const validatorProfile = [
    param('id').isInt().withMessage('El ID debe ser un número entero')
];

const validator = (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};

export default {
    validatorProfile,
    validator
}; 