import { Request, Response } from 'express';
import { refreshToken } from '../../Helpers/Token/refreshToken';

const refreshTokenController = (req: Request, res: Response) => {
    const oldToken = req.headers.authorization?.split(' ')[1];
    if (!oldToken) return res.status(401).json({ message: 'Token no proporcionado' });

    const newToken = refreshToken(oldToken, process.env.KEY_TOKEN!);
    if (!newToken) return res.status(401).json({ message: 'Token inválido' });

    res.json({ token: newToken });
};

export default refreshTokenController; 