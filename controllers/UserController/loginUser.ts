import { Request, Response } from 'express';
import UserService from '../../services/userServices/UserService';
import LoginUser from '../../Dto/UserDto/loginUserDto';
import generateToken from '../../Helpers/Token/generateToken';

let loginUser = async (req: Request, res: Response) => {
    try {
        const { email, contraseña } = req.body;
        const login = await UserService.login(new LoginUser(email, contraseña));
        if (login.logged) {
            return res.status(200).json({
                status: login.status,
                token: generateToken({ id: login.id, role: login.role }, process.env.KEY_TOKEN, 50)
            });
        }
        return res.status(401).json({
            status: login.status
        });
    } catch (error) {
        console.log(error);
    }
}

export default loginUser; 