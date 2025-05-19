import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';

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
        if (typeof decoded === 'object' && decoded !== null) {
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