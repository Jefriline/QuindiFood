import { Request, Response } from 'express';

const verifyRoleController = async (req: Request, res: Response) => {
    res.status(200).json({ 
        success: true, 
        message: 'Rol verificado correctamente',
        user: req.user 
    });
};

export default verifyRoleController; 