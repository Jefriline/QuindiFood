import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

type TokenUser = {
    id: number;
    role: string;
    email?: string;
    [key: string]: any;
};

function extractUserFromToken(decoded: any): TokenUser | null {
    if (
        typeof decoded === 'object' &&
        decoded !== null
    ) {
        // Caso 1: datos en la raíz
        if (typeof decoded.id === 'number' && typeof decoded.role === 'string') {
            return { id: decoded.id, role: decoded.role, email: decoded.email };
        }
        // Caso 2: datos en 'data'
        if (
            typeof decoded.data === 'object' &&
            decoded.data !== null &&
            typeof decoded.data.id === 'number' &&
            typeof decoded.data.role === 'string'
        ) {
            return { id: decoded.data.id, role: decoded.data.role, email: decoded.data.email };
        }
    }
    return null;
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
        const decoded = jwt.verify(token, secret, { ignoreExpiration: true });
        const user = extractUserFromToken(decoded);
        if (user) {
            req.user = { ...user, email: user.email ?? "" };
            next();
        } else {
            return res.status(401).json({ success: false, message: 'Token no válido' });
        }
    } catch (err) {
        return res.status(401).json({ success: false, message: 'Token no válido' });
    }
};

export default verifyTokenRefresh; 