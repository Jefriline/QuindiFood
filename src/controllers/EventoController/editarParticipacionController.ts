import { Request, Response } from 'express';
import EventoService from '../../services/EventoService/eventoService';
import { BlobServiceClient, BlobSASPermissions } from '@azure/storage-blob';

const editarParticipacion = async (req: Request, res: Response) => {
    try {
        const { id_participacion } = req.params;
        const { titulo, descripcion, precio } = req.body;
        let imagen_participacion_url: string | undefined = undefined;

        // Subir imagen_participacion si se envía
        if (req.files && (req.files as any)['imagen_participacion']) {
            const file = (req.files as any)['imagen_participacion'][0];
            const connectionString = process.env.AZURE_STORAGE_CONECTION_STRING;
            if (!connectionString) throw new Error('Azure Storage connection string is not defined');
            const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
            const containerClient = blobServiceClient.getContainerClient('images');
            const blobClient = containerClient.getBlockBlobClient(file.originalname);
            await blobClient.uploadData(file.buffer);
            const sasOptions = { permissions: BlobSASPermissions.parse('r'), expiresOn: new Date('2099-12-31') };
            imagen_participacion_url = await blobClient.generateSasUrl(sasOptions);
        }

        // Construir objeto solo con los campos enviados
        const updateFields: any = {};
        if (titulo) updateFields.titulo = titulo;
        if (descripcion) updateFields.descripcion = descripcion;
        if (precio) updateFields.precio = precio;
        if (imagen_participacion_url) updateFields.imagen_participacion = imagen_participacion_url;

        const resultado = await EventoService.editarParticipacionPorId(
            Number(id_participacion),
            updateFields
        );

        if (!resultado.success) {
            return res.status(400).json({ 
                status: 'Error', 
                message: resultado.message 
            });
        }

        res.status(200).json({ 
            status: 'Éxito', 
            message: 'Participación actualizada exitosamente', 
            participacion: resultado.participacion 
        });
    } catch (error: any) {
        console.error('Error al editar participación:', error);
        res.status(500).json({ 
            status: 'Error', 
            message: error.message || 'Error interno del servidor' 
        });
    }
};

export default editarParticipacion; 