import { Request, Response } from 'express';
import CrearEventoDto from '../../Dto/EventoDto/crearEventoDto';
import EventoService from '../../services/EventoService/eventoService';
import { BlobServiceClient, BlobSASPermissions } from '@azure/storage-blob';

const crearEvento = async (req: Request, res: Response) => {
    try {
        const { nombre, descripcion, fecha_inicio, fecha_fin } = req.body;
        // Validar que la imagen del evento esté presente
        if (!req.files || !(req.files as any)['imagen_evento']) {
            return res.status(400).json({
                status: 'Error',
                message: 'La imagen del evento es obligatoria.'
            });
        }
        let imagen_evento_url: string | undefined = undefined;

        // Subir imagen_evento
        const imagen_evento_file = (req.files as any)['imagen_evento'][0];
        const connectionString = process.env.AZURE_STORAGE_CONECTION_STRING;
        if (!connectionString) throw new Error('Azure Storage connection string is not defined');
        const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
        const containerClient = blobServiceClient.getContainerClient('images');
        const blobClient = containerClient.getBlockBlobClient(imagen_evento_file.originalname);
        await blobClient.uploadData(imagen_evento_file.buffer);
        const sasOptions = { permissions: BlobSASPermissions.parse('r'), expiresOn: new Date('2099-12-31') };
        imagen_evento_url = await blobClient.generateSasUrl(sasOptions);


        const eventoDto = new CrearEventoDto(
            nombre,
            descripcion,
            fecha_inicio,
            fecha_fin,
            imagen_evento_url
        );

        const idAdmin = req.user?.id;
        if (!idAdmin) {
            return res.status(401).json({ status: 'Error', message: 'No se pudo obtener el ID del administrador.' });
        }
        const resultado = await EventoService.crearEvento(eventoDto, idAdmin);
        if (!resultado.success) {
            return res.status(400).json({ status: 'Error', message: resultado.message });
        }
        res.status(201).json({ status: 'Éxito', message: 'Evento creado exitosamente', evento: resultado.evento });
    } catch (error: any) {
        console.error('Error al crear evento:', error);
        res.status(500).json({ status: 'Error', message: error.message || 'Error interno del servidor' });
    }
};


export default crearEvento; 