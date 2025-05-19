import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

type TokenUser = {
    id: number;
    email: string;
    role: string;
    [key: string]: any;
};

function isTokenUser(obj: any): obj is TokenUser {
    return (
        typeof obj === 'object' &&
        obj !== null &&
        typeof obj.id === 'number' &&
        typeof obj.role === 'string' &&
        typeof obj.email === 'string'
    );
}

const verifyTokenRefresh = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ success: false, message: 'Token no proporcionado' });
    }
    const token = authHeader.split(' ')[1];
    const secret = process.env.KEY_TOKEN;
    if (!secret) {
        return res.status(500).json({ success: false, message: 'No hay clave secreta configurada' });
    }
    try {
        // Ignora la expiración
        const decoded = jwt.verify(token, secret, { ignoreExpiration: true });
        if (isTokenUser(decoded)) {
            req.user = decoded;
            next();
        } else {
            return res.status(401).json({ success: false, message: 'Token no válido' });
        }
    } catch (err) {
        return res.status(401).json({ success: false, message: 'Token no válido' });
    }
};

export default verifyTokenRefresh; 