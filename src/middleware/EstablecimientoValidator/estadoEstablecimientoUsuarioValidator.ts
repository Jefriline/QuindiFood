import { Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';

class EstadoEstablecimientoUsuarioValidator {
    static validateRequest(req: Request, res: Response, next: NextFunction) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Errores de validación',
                errors: errors.array()
            });
        }
        next();
    }

    static validateToken(req: Request, res: Response, next: NextFunction) {
        // Verificar que el token esté presente y sea válido
        if (!req.headers.authorization) {
            return res.status(401).json({
                success: false,
                message: 'Token de autorización requerido'
            });
        }
        next();
    }
}

export default EstadoEstablecimientoUsuarioValidator; 