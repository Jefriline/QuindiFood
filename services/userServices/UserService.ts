import UserRepository from '../../repositories/UserRepository/userRepository';
import LoginUser from '../../Dto/UserDto/loginUserDto';
import RegisterUser from '../../Dto/UserDto/registerUserDto';
import RegisterAdmin from '../../Dto/UserDto/registerAdminDto';
import UserProfileDto from '../../Dto/UserDto/userProfileDto';
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

    static async getById(userProfile: UserProfileDto) {
        return await UserRepository.getById(userProfile.id);
    }

    static async registerAdmin(adminData: RegisterAdmin) {
        // Verificar si el email ya existe
        const emailExists = await UserRepository.emailExists(adminData.email);
        if (emailExists) {
            throw new Error('El email ya está registrado');
        }

        // Registrar administrador
        const hashedPassword = await generateHash(adminData.contraseña);
        const adminToRegister = new RegisterAdmin(adminData.nombre, adminData.email, hashedPassword, adminData.codigoAdmin);
        return await UserRepository.addAdmin(adminToRegister);
    }
}

export default UserService;