import { Request, Response } from 'express';
import UserService from '../../services/userServices/UserService';

const confirmAccount = async (req: Request, res: Response) => {
    const { token } = req.query;
    if (!token) return res.status(400).json({ success: false, message: 'Token requerido' });

    const result = await UserService.confirmAccount(token as string);
    if (result.success) {
        return res.json(result);
    } else {
        return res.status(400).json(result);
    }
};

export default confirmAccount; 