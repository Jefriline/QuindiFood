import { Request, Response, NextFunction } from 'express';
import multer from 'multer';

export const uploadParticipacion = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Solo se permiten archivos de imagen'));
        }
    }
}).fields([
    { name: 'imagen_participacion', maxCount: 1 }
]);

const agregarParticipacionValidator = (req: Request, res: Response, next: NextFunction) => {
    const { titulo, precio, id_establecimiento } = req.body;

    if (!titulo || typeof titulo !== 'string' || titulo.trim().length < 3) {
        return res.status(400).json({
            status: 'Error',
            message: 'El título es obligatorio y debe tener al menos 3 caracteres.'
        });
    }
    if (!precio || isNaN(Number(precio)) || Number(precio) < 0) {
        return res.status(400).json({
            status: 'Error',
            message: 'El precio es obligatorio y debe ser un número mayor o igual a 0.'
        });
    }
    if (!id_establecimiento || isNaN(Number(id_establecimiento))) {
        return res.status(400).json({
            status: 'Error',
            message: 'El ID del establecimiento es obligatorio y debe ser un número válido.'
        });
    }
    next();
};

export default agregarParticipacionValidator; 