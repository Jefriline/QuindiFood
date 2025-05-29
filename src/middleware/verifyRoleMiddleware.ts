import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

export const verifyRoleToken = (req: Request, res: Response, next: NextFunction) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        const role = req.body.role?.toUpperCase();

        if (!token) {
            return res.status(401).json({ success: false, message: 'Token no proporcionado' });
        }

        if (!role) {
            return res.status(400).json({ success: false, message: 'Rol no proporcionado' });
        }

        const validRoles = ['ADMIN', 'CLIENTE', 'PROPIETARIO'];
        if (!validRoles.includes(role)) {
            return res.status(400).json({ success: false, message: 'Rol no válido' });
        }

        const decoded = jwt.verify(token, process.env.KEY_TOKEN || 'default_secret') as any;
        const userRole = decoded.data.role;


        if (userRole === role) {
            req.user = decoded.data;
            next();
        } else {
            return res.status(403).json({ 
                success: false, 
                message: 'Rol no coincide',
                tokenRole: userRole,
                requestedRole: role
            });
        }
    } catch (error) {
        console.error('Error en verifyRoleToken:', error);
        return res.status(401).json({ success: false, message: 'Token inválido' });
    }
}; 