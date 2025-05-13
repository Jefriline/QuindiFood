import { Request, Response, NextFunction } from 'express';

const verifyRole = (requiredRoles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!req.user) {
            return res.status(403).json({
                success: false,
                message: 'No se encontró información de usuario'
            });
        }

        if (requiredRoles.includes(req.user.role)) {
            next();
        } else {
            return res.status(403).json({
                success: false,
                message: 'No tienes permisos para realizar esta acción'
            });
        }
    };
};

export default verifyRole; 