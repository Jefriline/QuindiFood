import { Request, Response, NextFunction } from 'express';

const verifyUserId = (req: Request, res: Response, next: NextFunction) => {
    let id = req.user?.id;
    if (typeof id === 'string') {
        id = Number(id);
    }
    if (!id || isNaN(id) || id <= 0) {
        return res.status(401).json({
            success: false,
            message: 'Token inválido: ID de usuario incorrecto'
        });
    }
    (req as any).user.id = id;
    next();
};

export default verifyUserId; 