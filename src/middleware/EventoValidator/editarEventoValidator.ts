import { Request, Response, NextFunction } from 'express';
import multer from 'multer';

export const uploadEditarEvento = multer({
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
    { name: 'imagen_evento', maxCount: 1 }
]);

const editarEventoValidator = (req: Request, res: Response, next: NextFunction) => {
    const { nombre, descripcion, fecha_inicio, fecha_fin } = req.body;

    // Si no se envía ningún campo, error
    if (!nombre && !descripcion && !fecha_inicio && !fecha_fin && !req.files) {
        return res.status(400).json({
            status: 'Error',
            message: 'Debes enviar al menos un campo para actualizar.'
        });
    }
    if (nombre && (typeof nombre !== 'string' || nombre.trim().length < 3)) {
        return res.status(400).json({
            status: 'Error',
            message: 'El nombre debe tener al menos 3 caracteres.'
        });
    }
    if (descripcion && (typeof descripcion !== 'string' || descripcion.trim().length < 10)) {
        return res.status(400).json({
            status: 'Error',
            message: 'La descripción debe tener al menos 10 caracteres.'
        });
    }
    if (fecha_inicio && isNaN(Date.parse(fecha_inicio))) {
        return res.status(400).json({
            status: 'Error',
            message: 'La fecha de inicio debe tener un formato válido.'
        });
    }
    if (fecha_fin && isNaN(Date.parse(fecha_fin))) {
        return res.status(400).json({
            status: 'Error',
            message: 'La fecha de finalización debe tener un formato válido.'
        });
    }
    if (fecha_inicio && fecha_fin && new Date(fecha_inicio) >= new Date(fecha_fin)) {
        return res.status(400).json({
            status: 'Error',
            message: 'La fecha de inicio debe ser anterior a la fecha de finalización.'
        });
    }
    next();
};

export default editarEventoValidator; 