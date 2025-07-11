import { Request, Response } from 'express';
import UserService from '../../services/userServices/UserService';

const FRONTEND_URL = process.env.FRONTEND_URL || 'https://front-quindi-food.vercel.app';

const confirmAccount = async (req: Request, res: Response) => {
    const { token } = req.query;
    if (!token) return res.redirect(`${FRONTEND_URL}/confirmacion-error`);

    console.log('Token recibido:', req.query.token);
    console.log('KEY_TOKEN:', process.env.KEY_TOKEN);

    const result = await UserService.confirmAccount(token as string);
    if (result.success && result.message.includes('confirmada. Ya puedes iniciar sesión')) {
        return res.redirect(`${FRONTEND_URL}/confirmacion-exitosa`);
    } else if (result.success && result.message.includes('ya estaba confirmada')) {
        return res.redirect(`${FRONTEND_URL}/cuenta-ya-confirmada`);
    } else {
        return res.redirect(`${FRONTEND_URL}/confirmacion-error`);
    }
};

export default confirmAccount; 