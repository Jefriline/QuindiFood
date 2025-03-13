import generateHash from '../../Helpers/Hash/generateHash';

class UserService {
    // static async register(ru: RegisterUser) {
    //     ///
    // }

    // static async login(log: Loginuser) {
    //     ///
    // }
}

export default UserService;

//Tambien

// import { UserRepository } from '../repositories/UserRepository';
// import { UserDto } from '../Dto/UserDto';

// export class UserService {
//     private userRepository: UserRepository = new UserRepository();

//     async authenticate(email: string, password: string): Promise<UserDto | null> {
//         const user = await this.userRepository.findByEmail(email);
//         if (user && user.password === password) {
//             return user;
//         }
//         return null;
//     }

//     async createUser(userData: Partial<UserDto>): Promise<UserDto> {
//         const user = this.userRepository.save(userData as UserDto);
//         return user;
//     }

//     async generatePasswordResetToken(email: string): Promise<string> {
//         // Lógica para generar un token de recuperación de contraseña
//         return 'reset_token';
//     }

//     async getUserById(id: number): Promise<UserDto | undefined> {
//         return this.userRepository.findById(id);
//     }

//     async updateUser(id: number, userData: Partial<UserDto>): Promise<UserDto> {
//         return this.userRepository.update(id, userData);
//     }

//     async changeUserRole(id: number, role: string): Promise<UserDto> {
//         return this.userRepository.update(id, { role });
//     }
// }