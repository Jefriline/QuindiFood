import { Request, Response } from "express";
import UserService from "../../services/userServices/UserService";
import UserProfileDto from "../../Dto/UserDto/userProfileDto";

let userProfile = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const profile = new UserProfileDto(parseInt(id));
        
        const user = await UserService.getById(profile.id);
        return res.status(200).json({
            status: 'success',
            data: user
        });
    } catch (error: any) {
        return res.status(500).json({ error: error.message });
    }
}

export default userProfile; 