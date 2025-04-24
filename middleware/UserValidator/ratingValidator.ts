import { Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';

const validatorRating = [
    body('puntuacion')
        .notEmpty()
        .withMessage('La puntuación es requerida')
        .isInt({ min: 1, max: 5 })
        .withMessage('La puntuación debe estar entre 1 y 5')
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
    validatorRating,
    validator
}; 