import RegisterUser from '../../Dto/UserDto/registerUserDto';
import db from '../../config/config-db';


class UserRepository {

  static async add(ru: RegisterUser) {
    const sql = 'INSERT INTO "user" (name, email, password) VALUES ($1, $2, $3)';
    const values = [ru.name, ru.email, ru.password];
    return db.query(sql, values);
  }

  
}

export default UserRepository;
