import { Request, Response, NextFunction } from 'express';

const simpleUserIdOptional = (req: Request, res: Response, next: NextFunction) => {
    console.log('=== SIMPLE USER ID OPTIONAL MIDDLEWARE ===');
    const usuario = (req as any).user;
    console.log('Usuario completo:', usuario);
    
    if (!usuario) {
        console.log('No hay usuario en req.user (acceso anónimo permitido)');
        return next();
    }
    
    let id = usuario.id;
    console.log('ID original:', id, 'tipo:', typeof id);
    // Convertir a número
    if (typeof id === 'string') {
        id = Number(id);
        console.log('ID convertido:', id, 'tipo:', typeof id);
    }
    // Validar que sea un número válido
    if (!id || isNaN(id) || id <= 0) {
        console.log('ERROR: ID inválido');
        return res.status(400).json({ message: 'ID de usuario inválido' });
    }
    // Asegurar que el ID sea número
    (req as any).user.id = id;
    console.log('ID final asignado:', (req as any).user.id);
    console.log('=================================');
    next();
};

export default simpleUserIdOptional; 