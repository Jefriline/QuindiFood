import { Request, Response } from 'express';
import PromocionService from '../../services/PromocionService/promocionService';
import { BlobServiceClient, BlobSASPermissions } from '@azure/storage-blob';

const editarPromocion = async (req: Request, res: Response) => {
    try {
        const idUsuario = (req as any).user?.id;
        if (!idUsuario) {
            return res.status(401).json({ success: false, message: 'No autenticado' });
        }

        const { id } = req.params;
        if (!id || isNaN(parseInt(id))) {
            return res.status(400).json({ success: false, message: 'ID de promoción inválido' });
        }

        const { encabezado, descripcion, fecha_inicio, fecha_fin } = req.body;

        // Preparar datos para actualizar
        const datosActualizados: any = {};
        if (encabezado !== undefined) datosActualizados.encabezado = encabezado;
        if (descripcion !== undefined) datosActualizados.descripcion = descripcion;

        // Validar y procesar fechas si se proporcionan
        if (fecha_inicio !== undefined || fecha_fin !== undefined) {
            const fechaInicio = fecha_inicio ? new Date(fecha_inicio) : undefined;
            const fechaFin = fecha_fin ? new Date(fecha_fin) : undefined;

            // Si se proporcionan ambas fechas, validar que sean coherentes
            if (fechaInicio && fechaFin && fechaInicio >= fechaFin) {
                return res.status(400).json({
                    success: false,
                    message: 'La fecha de inicio debe ser anterior a la fecha de fin'
                });
            }

            // Validar que la fecha de fin sea futura
            if (fechaFin && fechaFin <= new Date()) {
                return res.status(400).json({
                    success: false,
                    message: 'La fecha de fin debe ser posterior a la fecha actual'
                });
            }

            if (fechaInicio) datosActualizados.fecha_inicio = fechaInicio;
            if (fechaFin) datosActualizados.fecha_fin = fechaFin;
        }

        // Procesar nueva imagen si se subió
        if (req.file) {
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
            
            datosActualizados.imagen_promocional = imagenUrl;
        }

        const resultado = await PromocionService.editarPromocion(
            parseInt(id),
            idUsuario,
            datosActualizados
        );

        return res.status(200).json({
            success: true,
            message: 'Promoción actualizada exitosamente',
            data: resultado
        });
    } catch (error: any) {
        console.error('Error al editar promoción:', error);
        return res.status(500).json({
            success: false,
            message: 'Error al editar la promoción',
            error: error?.message || 'Error desconocido'
        });
    }
};

export default editarPromocion; 