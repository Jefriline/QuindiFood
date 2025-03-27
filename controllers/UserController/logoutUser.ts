import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';

let logoutUser = async (req: Request, res: Response) => {
    try {
        const token = req.headers.authorization;
        
        if (!token) {
            return res.status(401).json({
                status: "Error",
                message: "Token no proporcionado"
            });
        }

        return res.status(200).json({
            status: "Sesión cerrada exitosamente",
            message: "Token invalidado"
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            status: "Error interno del servidor",
            message: "Error al cerrar sesión"
        });
    }
}

export default logoutUser; 