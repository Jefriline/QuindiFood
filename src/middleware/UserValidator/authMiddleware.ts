import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface RequestWithUser extends Request {
    user?: {
        id: number;
        email: string;
        role: string;
        [key: string]: any;
    };
}

const authMiddleware = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(401).json({
                status: 'Error',
                message: 'No se proporcionó token de autenticación'
            });
        }

        const decoded = jwt.verify(token, process.env.KEY_TOKEN || 'tu_clave_secreta') as any;
        if (!decoded.data || !decoded.data.id) {
            return res.status(401).json({
                status: 'Error',
                message: 'Token inválido: no contiene ID de usuario'
            });
        }
        
        req.user = { 
            id: decoded.data.id,
            email: decoded.data.email,
            role: decoded.data.role
        };
        next();
    } catch (error) {
        console.error('Error al verificar token:', error);
        return res.status(401).json({
            status: 'Error',
            message: 'Token inválido o expirado'
        });
    }
};

export default authMiddleware; 