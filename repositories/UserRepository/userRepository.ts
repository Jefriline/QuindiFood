import RegisterUser from '../../Dto/UserDto/registerUserDto';
import bcrypt from 'bcryptjs';

class UserRepository {

  static async add(ru: RegisterUser) {
    const sql = 'INSERT INTO user (name, email, password) VALUES (?, ?, ?)';
    //
  }

  
}

export default UserRepository;
