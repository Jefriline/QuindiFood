import { Request, Response } from 'express';
import EventoService from '../../services/EventoService/eventoService';
import { BlobServiceClient, BlobSASPermissions } from '@azure/storage-blob';

const editarEvento = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const id_admin = (req as any).user.id_usuario;
        const { nombre, descripcion, fecha_inicio, fecha_fin, patrocinador_nombre } = req.body;
        let imagen_evento_url: string | undefined = undefined;

        // Subir imagen_evento si se envía
        if (req.files && (req.files as any)['imagen_evento']) {
            const file = (req.files as any)['imagen_evento'][0];
            const connectionString = process.env.AZURE_STORAGE_CONECTION_STRING;
            if (!connectionString) throw new Error('Azure Storage connection string is not defined');
            const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
            const containerClient = blobServiceClient.getContainerClient('images');
            const blobClient = containerClient.getBlockBlobClient(file.originalname);
            await blobClient.uploadData(file.buffer);
            const sasOptions = { permissions: BlobSASPermissions.parse('r'), expiresOn: new Date('2099-12-31') };
            imagen_evento_url = await blobClient.generateSasUrl(sasOptions);
        }
        // Construir objeto solo con los campos enviados
        const updateFields: any = {};
        if (nombre) updateFields.nombre = nombre;
        if (descripcion) updateFields.descripcion = descripcion;
        if (fecha_inicio) updateFields.fecha_inicio = fecha_inicio;
        if (fecha_fin) updateFields.fecha_fin = fecha_fin;
        if (imagen_evento_url) updateFields.imagen_evento = imagen_evento_url;

        const resultado = await EventoService.editarEvento(Number(id), updateFields);
        if (!resultado.success) {
            return res.status(400).json({ status: 'Error', message: resultado.message });
        }
        res.status(200).json({ status: 'Éxito', message: 'Evento actualizado exitosamente', evento: resultado.evento });
    } catch (error: any) {
        console.error('Error al editar evento:', error);
        res.status(500).json({ status: 'Error', message: error.message || 'Error interno del servidor' });
    }
};

export default editarEvento; 