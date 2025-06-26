import { Request, Response, NextFunction } from 'express';
import db from '../../config/config-db';

export async function onlyAdmin(req: any, res: Response, next: NextFunction) {
    try {
        if (!req.user || req.user.role !== 'ADMIN') {
            return res.status(403).json({ 
                success: false,
                message: 'Solo los administradores pueden realizar esta acción.' 
            });
        }

        // Verificar que el usuario realmente existe en la tabla administrador_sistema
        const idUsuario = req.user.id;
        const result = await db.query(
            'SELECT 1 FROM administrador_sistema WHERE id_administrador = $1',
            [idUsuario]
        );

        if (result.rowCount === 0) {
            return res.status(403).json({
                success: false,
                message: 'El usuario no está registrado como administrador del sistema.'
            });
        }

        next();
    } catch (error) {
        console.error('Error en middleware onlyAdmin:', error);
        return res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
} 