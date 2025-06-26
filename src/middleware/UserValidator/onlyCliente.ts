import { Request, Response, NextFunction } from 'express';

export function onlyCliente(req: any, res: Response, next: NextFunction) {
    if (!req.user || req.user.role !== 'CLIENTE') {
        return res.status(403).json({ message: 'Solo los clientes pueden registrar establecimientos.' });
    }
    req.body.FK_id_usuario = req.user.id;
    next();
} 