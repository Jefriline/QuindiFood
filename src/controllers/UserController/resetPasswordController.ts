import { Request, Response } from 'express';
import UserService from '../../services/userServices/UserService';
import ResetPasswordDto from '../../Dto/UserDto/resetPasswordDto';

 const resetPassword = async (req: Request, res: Response) => {
    const dto = new ResetPasswordDto(req.body.email, req.body.contraseña, req.body.confirmarContraseña);
    const result = await UserService.resetPassword(dto);
    res.status(result.success ? 200 : 400).json(result);
};

export default resetPassword;