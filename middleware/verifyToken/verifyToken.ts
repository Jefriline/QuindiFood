import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export const verifyToken = (req: Request, res: Response, next: NextFunction) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Token no proporcionado'
            });
        }

        const decoded = jwt.verify(token, process.env.KEY_TOKEN || 'tu_secreto_jwt') as any;
        
        // Verificar que el token tenga la estructura correcta
        if (!decoded.data || !decoded.data.id || !decoded.data.role) {
            return res.status(401).json({
                success: false,
                message: 'Token inválido - estructura incorrecta'
            });
        }

        // Asignar los datos del usuario desde la estructura correcta del token
        req.user = decoded.data;
        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: 'Usuario no autenticado'
        });
    }
}; 