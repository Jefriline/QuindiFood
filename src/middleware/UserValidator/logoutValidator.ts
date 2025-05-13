import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';



class LogoutValidator {
    public validatorLogout = async (req: Request, res: Response, next: NextFunction) => {
        const token = req.headers.authorization;

        if (!token) {
            return res.status(401).json(
                { status: 'No has enviado un token' }
            );
        }

        try {
            const tokenParts = token.split(' ');
            if (tokenParts.length !== 2 || tokenParts[0] !== 'Bearer') {
                return res.status(401).json(
                    { status: 'Formato de token inválido' }
                );
            }

            // Verificar que el token sea válido
            jwt.verify(tokenParts[1], process.env.KEY_TOKEN as string);
            next();
        } catch (error) {
            return res.status(403).json(
                { status: 'no autorizado' }
            );
        }
    }
}

export default new LogoutValidator(); 