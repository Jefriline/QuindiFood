import { Request, Response, NextFunction } from 'express';

export const validatePassword = (req: Request, res: Response, next: NextFunction) => {
    const { contraseña } = req.body;

    // Validar longitud mínima
    if (!contraseña || contraseña.length < 8) {
        return res.status(400).json({
            success: false,
            message: 'La contraseña debe tener al menos 8 caracteres'
        });
    }

    // Validar que contenga al menos una letra mayúscula
    if (!/[A-Z]/.test(contraseña)) {
        return res.status(400).json({
            success: false,
            message: 'La contraseña debe contener al menos una letra mayúscula'
        });
    }

    // Validar que contenga al menos una letra minúscula
    if (!/[a-z]/.test(contraseña)) {
        return res.status(400).json({
            success: false,
            message: 'La contraseña debe contener al menos una letra minúscula'
        });
    }

    // Validar que contenga al menos un número
    if (!/[0-9]/.test(contraseña)) {
        return res.status(400).json({
            success: false,
            message: 'La contraseña debe contener al menos un número'
        });
    }

    // Validar que contenga al menos un carácter especial
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(contraseña)) {
        return res.status(400).json({
            success: false,
            message: 'La contraseña debe contener al menos un carácter especial'
        });
    }

    next();
}; 