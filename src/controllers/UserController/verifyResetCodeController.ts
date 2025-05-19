import { Request, Response } from 'express';
import UserService from '../../services/userServices/UserService';
import VerifyResetCodeDto from '../../Dto/UserDto/verifyResetCodeDto';

 const verifyResetCode = async (req: Request, res: Response) => {
    const dto = new VerifyResetCodeDto(req.body.email, req.body.code);
    const email = dto.email.trim().toLowerCase();
    const code = String(dto.code).trim();
    const result = await UserService.verifyResetCode(dto);
    res.status(result.success ? 200 : 400).json(result);
};

export default verifyResetCode;