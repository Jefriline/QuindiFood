import { Request, Response, NextFunction } from 'express';
import db from '../../config/config-db';

export async function onlyPropietario(req: any, res: Response, next: NextFunction) {
    try {
        if (!req.user || req.user.role !== 'PROPIETARIO') {
            return res.status(403).json({ 
                success: false,
                message: 'Solo los propietarios pueden gestionar productos.' 
            });
        }

        // Verificar que el usuario realmente existe en la tabla propietario_establecimiento
        const idUsuario = req.user.id;
        const result = await db.query(
            'SELECT 1 FROM propietario_establecimiento WHERE id_propietario = $1',
            [idUsuario]
        );

        if (result.rowCount === 0) {
            return res.status(403).json({
                success: false,
                message: 'El usuario no está registrado como propietario de establecimiento.'
            });
        }

        next();
    } catch (error) {
        console.error('Error en middleware onlyPropietario:', error);
        return res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
} 