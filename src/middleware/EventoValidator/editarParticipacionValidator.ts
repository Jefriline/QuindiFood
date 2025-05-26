import { Request, Response, NextFunction } from 'express';
import multer from 'multer';

// Configuración de multer para subida de imágenes
const storage = multer.memoryStorage();
const uploadEditarParticipacion = multer({
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB
    },
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

const editarParticipacionValidator = (req: Request, res: Response, next: NextFunction) => {
    try {
        const { titulo, descripcion, precio } = req.body;
        const errors: string[] = [];

        // Validar campos opcionales si se envían
        if (titulo && titulo.length < 3) {
            errors.push('El título debe tener al menos 3 caracteres');
        }
        if (descripcion && descripcion.length < 10) {
            errors.push('La descripción debe tener al menos 10 caracteres');
        }
        if (precio && isNaN(Number(precio))) {
            errors.push('El precio debe ser un número válido');
        }

        // Verificar que al menos un campo se esté actualizando
        if (!titulo && !descripcion && !precio && !req.files) {
            errors.push('Debe enviar al menos un campo para actualizar');
        }

        if (errors.length > 0) {
            return res.status(400).json({
                status: 'Error',
                message: 'Error de validación',
                errors
            });
        }

        next();
    } catch (error: any) {
        res.status(400).json({
            status: 'Error',
            message: error.message
        });
    }
};

export { uploadEditarParticipacion };
export default editarParticipacionValidator; 