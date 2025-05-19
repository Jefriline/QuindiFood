import { Request, Response } from 'express';
import UserService from '../../services/userServices/UserService';
import RequestPasswordResetDto from '../../Dto/UserDto/requestPasswordResetDto';

 const requestPasswordReset = async (req: Request, res: Response) => {
    const dto = new RequestPasswordResetDto(req.body.email);
    const result = await UserService.requestPasswordReset(dto);
    res.status(result.success ? 200 : 400).json(result);
};

export default requestPasswordReset;