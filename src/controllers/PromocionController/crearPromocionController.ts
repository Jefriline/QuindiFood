import { Request, Response } from 'express';
import PromocionService from '../../services/PromocionService/promocionService';
import { BlobServiceClient, BlobSASPermissions } from '@azure/storage-blob';

const crearPromocion = async (req: Request, res: Response) => {
    try {
        const idUsuario = (req as any).user?.id;
        if (!idUsuario) {
            return res.status(401).json({ success: false, message: 'No autenticado' });
        }

        const { encabezado, descripcion, fecha_inicio, fecha_fin } = req.body;

        // Validar campos requeridos
        if (!encabezado || !descripcion || !fecha_inicio || !fecha_fin) {
            return res.status(400).json({
                success: false,
                message: 'Encabezado, descripción, fecha de inicio y fecha de fin son obligatorios'
            });
        }

        // Validar imagen promocional
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'La imagen promocional es obligatoria'
            });
        }

        // Validar fechas
        const fechaInicio = new Date(fecha_inicio);
        const fechaFin = new Date(fecha_fin);
        const fechaActual = new Date();

        if (fechaInicio >= fechaFin) {
            return res.status(400).json({
                success: false,
                message: 'La fecha de inicio debe ser anterior a la fecha de fin'
            });
        }

        if (fechaFin <= fechaActual) {
            return res.status(400).json({
                success: false,
                message: 'La fecha de fin debe ser posterior a la fecha actual'
            });
        }

        // Subir imagen a Blob Storage
        const blobServiceClient = BlobServiceClient.fromConnectionString(process.env.AZURE_STORAGE_CONECTION_STRING || "");
        const containerClient = blobServiceClient.getContainerClient('promociones');
        
        // Crear el container si no existe
        await containerClient.createIfNotExists();

        const fileName = `${Date.now()}-${req.file.originalname}`;
        const blobClient = containerClient.getBlockBlobClient(fileName);
        
        // Subir archivo
        await blobClient.uploadData(req.file.buffer);
        
        // Generar URL con SAS
        const sasOptions = {
            permissions: BlobSASPermissions.parse("r"),
            expiresOn: new Date("2099-12-31")
        };
        const imagenUrl = await blobClient.generateSasUrl(sasOptions);

        const promocionData = {
            encabezado,
            descripcion,
            imagen_promocional: imagenUrl,
            fecha_inicio: fechaInicio,
            fecha_fin: fechaFin
        };

        const resultado = await PromocionService.crearPromocion(promocionData, idUsuario);

        return res.status(201).json({
            success: true,
            message: 'Promoción creada exitosamente',
            data: resultado
        });
    } catch (error: any) {
        console.error('Error al crear promoción:', error);
        return res.status(500).json({
            success: false,
            message: 'Error al crear la promoción',
            error: error?.message || 'Error desconocido'
        });
    }
};

export default crearPromocion; 