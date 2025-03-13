import RegisterUser from '../../Dto/UserDto/registerUserDto';
import bcrypt from 'bcryptjs';

class UserRepository {

  static async add(ru: RegisterUser) {
    const sql = 'INSERT INTO user (name, email, password) VALUES (?, ?, ?)';
    //
  }

  
}

export default UserRepository;

// Este lo pongo por si sirve:
//import { UserDto } from '../Dto/UserDto';
// import { getRepository } from 'typeorm';

// export class UserRepository {
//     private userRepository = getRepository(UserDto);

//     async findByEmail(email: string): Promise<UserDto | undefined> {
//         return this.userRepository.findOne({ where: { email } });
//     }

//     async findById(id: number): Promise<UserDto | undefined> {
//         return this.userRepository.findOne(id);
//     }

//     async save(user: UserDto): Promise<UserDto> {
//         return this.userRepository.save(user);
//     }

//     async update(id: number, user: Partial<UserDto>): Promise<UserDto> {
//         await this.userRepository.update(id, user);
//         return this.userRepository.findOne(id);
//     }
// }