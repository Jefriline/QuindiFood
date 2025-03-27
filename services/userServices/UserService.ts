import UserRepository from '../../repositories/UserRepository/userRepository';
import LoginUser from '../../Dto/UserDto/loginUserDto';
import RegisterUser from '../../Dto/UserDto/registerUserDto';
import RegisterAdmin from '../../Dto/UserDto/registerAdminDto';
import UserProfileDto from '../../Dto/UserDto/userProfileDto';
import generateHash from '../../Helpers/Hash/generateHash';
import bcrypt from 'bcryptjs';
import fs from 'fs/promises';
import UpdateUserDto from '../../Dto/UserDto/updateUserDto';

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

    static async update(updateData: UpdateUserDto): Promise<boolean> {
        
            const user = await UserRepository.getById(updateData.id);
            if (!user) return false;

            // Si hay contraseña nueva, la hasheamos
            if (updateData.contraseña) {
                const salt = await bcrypt.genSalt(10);
                updateData.contraseña = await bcrypt.hash(updateData.contraseña, salt);
            }

            // Si hay foto de perfil, la convertimos a BYTEA
            if (updateData.foto_perfil && typeof updateData.foto_perfil === 'string') {
                const imageBuffer = await this.convertImageToBuffer(updateData.foto_perfil);
                updateData.foto_perfil = imageBuffer;
            }

            return await UserRepository.update(updateData);
    }

    private static async convertImageToBuffer(imagePath: string): Promise<Buffer> {
        try {
            const imageData = await fs.readFile(imagePath);
            return imageData;
        } catch (error) {
            console.error('Error al convertir imagen a buffer:', error);
            throw error;
        }
    }
}

export default UserService;