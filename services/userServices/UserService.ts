import UserRepository from '../../repositories/UserRepository/userRepository';
import LoginUser from '../../Dto/UserDto/loginUserDto';
import RegisterUser from '../../Dto/UserDto/registerUserDto';
import generateHash from '../../Helpers/Hash/generateHash';

class UserService {
    static async register(ru: RegisterUser) {
        // Verificar si el email ya existe
        const emailExists = await UserRepository.emailExists(ru.email);
        if (emailExists) {
            throw new Error('El email ya está registrado');
        }

        // Registrar usuario
        const hashedPassword = await generateHash(ru.contraseña);
        const userToRegister = new RegisterUser(ru.nombre, ru.email, hashedPassword);
        return await UserRepository.add(userToRegister);
    }

    static async login(log: LoginUser) {
        return await UserRepository.login(log);
    }

    static async getById(id: number) {
        return await UserRepository.getById(id);
    }
}

export default UserService;