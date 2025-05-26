import { Request, Response } from 'express';
import EventoService from '../../services/EventoService/eventoService';
import { BlobServiceClient, BlobSASPermissions } from '@azure/storage-blob';
import PatrocinadorDto from '../../Dto/EventoDto/patrocinadorDto';

const editarPatrocinador = async (req: Request, res: Response) => {
    try {
        const { id_patrocinador_evento } = req.params;
        const { nombre } = req.body;
        let logo_url: string | undefined = undefined;
        if (req.files && (req.files as any)['logo']) {
            const file = (req.files as any)['logo'][0];
            const connectionString = process.env.AZURE_STORAGE_CONECTION_STRING;
            if (!connectionString) throw new Error('Azure Storage connection string is not defined');
            const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
            const containerClient = blobServiceClient.getContainerClient('images');
            const blobClient = containerClient.getBlockBlobClient(file.originalname);
            await blobClient.uploadData(file.buffer);
            const sasOptions = { permissions: BlobSASPermissions.parse('r'), expiresOn: new Date('2099-12-31') };
            logo_url = await blobClient.generateSasUrl(sasOptions);
        }
        const patrocinadorDto = new PatrocinadorDto();
        if (nombre) patrocinadorDto.nombre = nombre;
        if (logo_url) patrocinadorDto.logo = logo_url;
        const resultado = await EventoService.editarPatrocinador(Number(id_patrocinador_evento), patrocinadorDto);
        if (!resultado.success) {
            return res.status(400).json({ status: 'Error', message: resultado.message });
        }
        res.status(200).json({ status: 'Éxito', patrocinador: resultado.patrocinador });
    } catch (error: any) {
        res.status(500).json({ status: 'Error', message: error.message || 'Error interno del servidor' });
    }
};

export default editarPatrocinador; 