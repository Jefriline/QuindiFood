import { Request, Response } from 'express';
import ParticipacionEventoDto from '../../Dto/EventoDto/participacionEventoDto';
import { BlobServiceClient, BlobSASPermissions } from '@azure/storage-blob';
import EventoService from '../../services/EventoService/eventoService';

const agregarParticipacion = async (req: Request, res: Response) => {
    try {
        const { id } = req.params; // id del evento
        const { id_establecimiento, titulo, precio, descripcion } = req.body;

        // Validar que la imagen de participación esté presente
        if (!req.files || !(req.files as any)['imagen_participacion']) {
            return res.status(400).json({
                status: 'Error',
                message: 'La imagen de participación es obligatoria.'
            });
        }

        // Subir imagen de participación
        const imagen_file = (req.files as any)['imagen_participacion'][0];
        const connectionString = process.env.AZURE_STORAGE_CONECTION_STRING;
        if (!connectionString) throw new Error('Azure Storage connection string is not defined');
        const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
        const containerClient = blobServiceClient.getContainerClient('images');
        const blobClient = containerClient.getBlockBlobClient(imagen_file.originalname);
        await blobClient.uploadData(imagen_file.buffer);
        const sasOptions = { permissions: BlobSASPermissions.parse('r'), expiresOn: new Date('2099-12-31') };
        const imagen_participacion_url = await blobClient.generateSasUrl(sasOptions);

        // Crear DTO
        const participacionDto = new ParticipacionEventoDto(
            Number(id),
            Number(id_establecimiento),
            titulo,
            Number(precio),
            descripcion,
            imagen_participacion_url
        );

        const resultado = await EventoService.agregarParticipacion(participacionDto);
        if (!resultado.success) {
            return res.status(400).json({ status: 'Error', message: resultado.message });
        }
        res.status(201).json({ status: 'Éxito', message: 'Participación agregada exitosamente', participacion: resultado.participacion });
    } catch (error: any) {
        console.error('Error al agregar participación:', error);
        res.status(500).json({ status: 'Error', message: error.message || 'Error interno del servidor' });
    }
};



export default agregarParticipacion; 