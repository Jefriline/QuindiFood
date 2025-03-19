import RegisterUser  from "../../Dto/UserDto/registerUserDto";
import { Request, Response } from "express";

let registerUser = async (req: Request, res: Response) => {
    try {
    //   const {
    //     name,
    //     email,
    //     password
    //   } = req.body;
  
      /*const registerUser = */
      
      return res.status(201).json(
        { status: 'User register' } 
      );
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  
  export default registerUser;