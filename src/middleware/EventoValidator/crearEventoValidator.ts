import { Request, Response, NextFunction } from 'express';
import multer from 'multer';


// Exporta upload para usarlo en la ruta
export const upload = multer({
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
    { name: 'imagen_evento', maxCount: 1 },
]);

const crearEventoValidator = (req: Request, res: Response, next: NextFunction) => {
    // Normalizar campos si llegan como array
    ['nombre', 'descripcion', 'fecha_inicio', 'fecha_fin'].forEach((key) => {
        if (Array.isArray(req.body[key])) {
            req.body[key] = req.body[key][0];
        }
    });

    const { nombre, descripcion, fecha_inicio, fecha_fin } = req.body;

    if (!nombre || typeof nombre !== 'string' || nombre.trim().length < 3) {
        return res.status(400).json({
            status: 'Error',
            message: 'El nombre del evento es obligatorio y debe tener al menos 3 caracteres.'
        });
    }
    if (!descripcion || typeof descripcion !== 'string' || descripcion.trim().length < 10) {
        return res.status(400).json({
            status: 'Error',
            message: 'La descripción es obligatoria y debe tener al menos 10 caracteres.'
        });
    }
    if (!fecha_inicio || isNaN(Date.parse(fecha_inicio))) {
        return res.status(400).json({
            status: 'Error',
            message: 'La fecha de inicio es obligatoria y debe tener un formato válido.'
        });
    }
    if (!fecha_fin || isNaN(Date.parse(fecha_fin))) {
        return res.status(400).json({
            status: 'Error',
            message: 'La fecha de finalización es obligatoria y debe tener un formato válido.'
        });
    }
    if (new Date(fecha_inicio) >= new Date(fecha_fin)) {
        return res.status(400).json({
            status: 'Error',
            message: 'La fecha de inicio debe ser anterior a la fecha de finalización.'
        });
    }
    next();
};

export default crearEventoValidator; 