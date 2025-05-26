import { Request, Response, NextFunction } from 'express';
import multer from 'multer';

export const uploadPatrocinador = multer({
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
    { name: 'logo', maxCount: 1 }
]);

// Para crear: nombre obligatorio, logo obligatorio
export const crearPatrocinadorValidator = (req: Request, res: Response, next: NextFunction) => {
    const { nombre } = req.body;
    if (!nombre || nombre.length < 2) {
        return res.status(400).json({ status: 'Error', message: 'El nombre es obligatorio y debe tener al menos 2 caracteres' });
    }
    if (!req.files || !(req.files as any)['logo']) {
        return res.status(400).json({ status: 'Error', message: 'El logo es obligatorio y debe ser una imagen' });
    }
    next();
};

// Para editar: ambos opcionales, pero al menos uno debe enviarse
export const editarPatrocinadorValidator = (req: Request, res: Response, next: NextFunction) => {
    const { nombre } = req.body;
    const tieneLogo = req.files && (req.files as any)['logo'];
    if (!nombre && !tieneLogo) {
        return res.status(400).json({ status: 'Error', message: 'Debes enviar al menos un campo para actualizar (nombre o logo)' });
    }
    if (nombre && nombre.length < 2) {
        return res.status(400).json({ status: 'Error', message: 'El nombre debe tener al menos 2 caracteres' });
    }
    next();
}; 