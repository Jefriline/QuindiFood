import UserRepository from '../../repositories/UserRepository/userRepository';
import LoginUser from '../../Dto/UserDto/loginUserDto';
import RegisterUser from '../../Dto/UserDto/registerUserDto';
import RegisterAdmin from '../../Dto/UserDto/registerAdminDto';
import UserProfileDto from '../../Dto/UserDto/userProfileDto';
import generateHash from '../../Helpers/Hash/generateHash';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import UpdateUserDto from '../../Dto/UserDto/updateUserDto';
import ToggleUserStatusDto from '../../Dto/UserDto/toggleUserStatusDto';
import jwt from 'jsonwebtoken';
import { sendEmailAzure, getConfirmationEmailTemplate, getVerificationCodeTemplate } from '../../Helpers/Azure/EmailHelper';
import generateToken from '../../Helpers/Token/generateToken';

import RequestPasswordResetDto from '../../Dto/UserDto/requestPasswordResetDto';
import ResetPasswordDto from '../../Dto/UserDto/resetPasswordDto';
import VerifyResetCodeDto from '../../Dto/UserDto/verifyResetCodeDto';

dotenv.config();

class UserService {
    static async register(ru: RegisterUser) {
        // 1. Verificar si el email ya existe
        const emailExists = await UserRepository.emailExists(ru.email);
        if (emailExists) {
            throw new Error('El email ya está registrado');
        }

        // 2. Registrar usuario con estado pendiente
        const hashedPassword = await generateHash(ru.contraseña);
        const userToRegister = new RegisterUser(ru.nombre, ru.email, hashedPassword);
        const usuario = await UserRepository.add(userToRegister); // Este ya lo guarda como 'pendiente'

        // 3. Generar token de confirmación (24h)
        const token = generateToken(
            { id: usuario.id_usuario, role: 'PENDIENTE' }, // Puedes agregar más datos si quieres
            process.env.KEY_TOKEN!,
            24 * 60 
        );

        // 4. Enviar correo de confirmaciónes
        const confirmationLink = `${process.env.BASE_URL}/user/confirmar-cuenta?token=${token}`;
        const html = getConfirmationEmailTemplate(usuario.nombre, confirmationLink);
        await sendEmailAzure(usuario.email, "Confirma tu cuenta en QuindiFood", html);

        return usuario;
    }

    static async login(log: LoginUser) {
        const result = await UserRepository.login(log);

        // Si no está autenticado, retorna como antes
        if (!result.logged) {
            return result;
        }

        // Obtener el usuario completo para verificar el estado
        const user = await UserRepository.getById(result.id);
        if (!user) {
            return { logged: false, status: "Usuario no encontrado" };
        }

        if (user.estado === "Pendiente") {
            return { logged: false, status: "La cuenta no ha sido confirmada. Revisa tu correo." };
        }
        if (user.estado === "Inactivo") {
            return { logged: false, status: "La cuenta está inactiva. Contacta al soporte." };
        }

        // Si está activo, retorna el resultado normal
        return result;
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

    static async update(updateData: UpdateUserDto): Promise<{ success: boolean; message: string }> {
        try {
            // Verificar si el usuario existe
            const userExists = await UserRepository.getById(updateData.id);
            if (!userExists) {
                return {
                    success: false,
                    message: `No se encontró un usuario con el ID ${updateData.id}`
                };
            }

            // Verificar si el nuevo email ya existe (solo si es diferente al email actual)
            if (updateData.email && updateData.email !== userExists.email) {
                const emailExists = await UserRepository.emailExists(updateData.email);
                if (emailExists) {
                    return {
                        success: false,
                        message: 'El email ya está registrado por otro usuario'
                    };
                }
            }

            if (updateData.contraseña) {
                const salt = await bcrypt.genSalt(10);
                updateData.contraseña = await bcrypt.hash(updateData.contraseña, salt);
            }

            const updated = await UserRepository.update(updateData);

            if (!updated) {
                return {
                    success: false,
                    message: 'Error al actualizar el usuario en la base de datos'
                };
            }

            return {
                success: true,
                message: 'Usuario actualizado exitosamente'
            };
        } catch (error) {
            console.error('Error en UserService.update:', error);
            throw error;
        }
    }

    static async delete(id: number): Promise<{ success: boolean; message: string }> {
        try {
            // Verificar si el usuario existe
            const userExists = await UserRepository.getById(id);
            if (!userExists) {
                return {
                    success: false,
                    message: `No se encontró un usuario con el ID ${id}`
                };
            }

            const deleted = await UserRepository.delete(id);

            if (!deleted) {
                return {
                    success: false,
                    message: 'Error al eliminar el usuario'
                };
            }

            return {
                success: true,
                message: 'Usuario eliminado exitosamente'
            };
        } catch (error) {
            console.error('Error en UserService.delete:', error);
            throw error;
        }
    }

    static async toggleUserStatus(toggleDto: ToggleUserStatusDto): Promise<{ success: boolean; message: string }> {
        try {
            // Verificar si el usuario existe
            const userExists = await UserRepository.getById(toggleDto.id_usuario);
            if (!userExists) {
                return {
                    success: false,
                    message: `No se encontró un usuario con el ID ${toggleDto.id_usuario}`
                };
            }

            // Verificar que el estado sea válido
            if (toggleDto.estado !== 'Activo' && toggleDto.estado !== 'Inactivo') {
                return {
                    success: false,
                    message: 'El estado debe ser "Activo" o "Inactivo"'
                };
            }

            const updated = await UserRepository.toggleUserStatus(toggleDto);

            if (!updated) {
                return {
                    success: false,
                    message: 'Error al actualizar el estado del usuario'
                };
            }

            return {
                success: true,
                message: `Estado del usuario actualizado exitosamente a ${toggleDto.estado}`
            };
        } catch (error) {
            console.error('Error en UserService.toggleUserStatus:', error);
            throw error;
        }
    }

    static async confirmAccount(token: string): Promise<{ success: boolean; message: string }> {
        try {
            const decoded = jwt.verify(token, process.env.KEY_TOKEN!) as any;
            console.log('Decoded:', decoded);
            if (!decoded.data || typeof decoded.data.id !== 'number') {
                return { success: false, message: 'Token inválido o expirado' };
            }
            const userId = decoded.data.id;

            // Buscar usuario
            const user = await UserRepository.getById(userId);
            if (!user) return { success: false, message: 'Usuario no encontrado' };
            if (user.estado === 'Activo') {
                return { success: true, message: 'La cuenta ya estaba confirmada. Puedes iniciar sesión.' };
            }

            await UserRepository.updateEstadoConfirmacion(userId);
            return { success: true, message: 'Cuenta confirmada. Ya puedes iniciar sesión.' };
        } catch (err) {
            return { success: false, message: 'Token inválido o expirado' };
        }
    }

    static async requestPasswordReset(dto: RequestPasswordResetDto) {
        const user = await UserRepository.getByEmail(dto.email);
        if (!user || user.estado !== 'Activo') {
            return { success: false, message: 'Usuario no válido' };
        }
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
        await UserRepository.upsertPasswordResetCode(dto.email, code, expiresAt);
        const html = getVerificationCodeTemplate(user.nombre, code);
        await sendEmailAzure(dto.email, "Código de verificación - QuindiFood", html);
        return { success: true, message: 'Se ha enviado un código de verificación a tu correo electrónico' };
    }

    static async verifyResetCode(dto: VerifyResetCodeDto) {
        const codeRow = await UserRepository.getPasswordResetCode(dto.email, dto.code);
        if (!codeRow) {
            return { success: false, message: 'Código inválido o expirado' };
        }
        await UserRepository.verifyPasswordResetCode(dto.email);
        return { success: true, message: 'Código verificado correctamente' };
    }

    static async resetPassword(dto: ResetPasswordDto) {
        if (dto.contraseña !== dto.confirmarContraseña) {
            return { success: false, message: 'Las contraseñas no coinciden' };
        }
        const verified = await UserRepository.isPasswordResetVerified(dto.email);
        if (!verified) {
            return { success: false, message: 'No se ha verificado el código o ha expirado' };
        }
        const hashedPassword = await generateHash(dto.contraseña);
        await UserRepository.updatePasswordByEmail(dto.email, hashedPassword);
        await UserRepository.deletePasswordResetCode(dto.email);
        return { success: true, message: 'Contraseña actualizada exitosamente' };
    }

    static async eliminarUsuarioCompleto(idUsuario: number, isAdmin = false, idFromToken?: number): Promise<{ success: boolean; message: string }> {
        try {
            const deleted = await UserRepository.eliminarUsuarioCompleto(idUsuario, isAdmin, idFromToken);
            if (deleted) {
                return {
                    success: true,
                    message: 'Usuario eliminado exitosamente'
                };
            } else {
                return {
                    success: false,
                    message: 'Error al eliminar el usuario'
                };
            }
        } catch (error: any) {
            return {
                success: false,
                message: error.message || 'Error al eliminar el usuario'
            };
        }
    }

    static async getEmailById(id: number): Promise<string | null> {
        return await UserRepository.getEmailById(id);
    }
}

export default UserService;