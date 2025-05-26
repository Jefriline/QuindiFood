import { Request, Response } from 'express';
import UserService from '../../services/userServices/UserService';
import UpdateUserDto from '../../Dto/UserDto/updateUserDto';
import UserProfileDto from '../../Dto/UserDto/userProfileDto';
import { CustomRequest } from '../../interfaces/customRequest';
import { uploadBlob, deleteBlob, deleteBlobByName, limpiarBlobsUsuario } from '../../Helpers/Azure/Blob-Storage/Blob-Storage';
import multer from 'multer';
import { BlobSASPermissions } from '@azure/storage-blob';
import { BlobServiceClient } from '@azure/storage-blob';



let updateUser = async (req: CustomRequest, res: Response) => {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({
                status: 'Error',
                message: 'No se pudo obtener el ID del usuario del token'
            });
        }

        // Manejar la subida de archivo si existe
        if (req.file) {
            // Obtener la foto actual del usuario
            const user = await UserService.getById(new UserProfileDto(req.user.id));
            if (user?.foto_perfil) {
                const currentFileName = user.foto_perfil.split('/').pop()?.split('?')[0];
                if (currentFileName) {
                    await deleteBlobByName('images', currentFileName);
                }
            }

            // Subir la nueva foto
            const connectionString = process.env.AZURE_STORAGE_CONECTION_STRING;
            if (!connectionString) {
                throw new Error('Azure Storage connection string is not defined');
            }
            
            const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
            const containerClient = blobServiceClient.getContainerClient('images');
            const blobClient = containerClient.getBlockBlobClient(req.file.originalname);
            
            // Subir el archivo
            await blobClient.uploadData(req.file.buffer);
            
            // Generar URL de visualización con SAS
            const sasOptions = {
                permissions: BlobSASPermissions.parse("r"),
                expiresOn: new Date("2099-12-31") 
            };
            
            const viewUrl = await blobClient.generateSasUrl(sasOptions);
            req.body.foto_perfil = viewUrl;
        }

        const { nombre, email, contraseña, descripcion, foto_perfil, plato_favorito } = req.body;
        const id = req.user.id;
        
        // Crear DTO solo con los campos que se proporcionaron
        const updateDto = new UpdateUserDto(id);
        if (nombre) updateDto.nombre = nombre;
        if (email) updateDto.email = email;
        if (contraseña) updateDto.contraseña = contraseña;
        if (descripcion) updateDto.descripcion = descripcion;
        if (foto_perfil) updateDto.foto_perfil = foto_perfil;
        if (plato_favorito) updateDto.plato_favorito = plato_favorito;
        
        const result = await UserService.update(updateDto);
        
        if (!result.success) {
            return res.status(400).json({ 
                status: 'Error', 
                message: result.message
            });
        }

        const updatedFields = [];
        if (nombre) updatedFields.push('nombre');
        if (email) updatedFields.push('email');
        if (contraseña) updatedFields.push('contraseña');
        if (descripcion) updatedFields.push('descripcion');
        if (foto_perfil) updatedFields.push('foto_perfil');
        if (plato_favorito) updatedFields.push('plato_favorito');

        return res.status(200).json({ 
            status: 'Éxito', 
            message: 'Usuario actualizado exitosamente',
            actualizados: updatedFields
        });
    } catch (error: any) {
        console.error('Error al actualizar usuario:', error);
        return res.status(500).json({ 
            status: 'Error', 
            message: 'Error en el servidor', 
            error: error.message 
        });
    }
};
export default updateUser; 