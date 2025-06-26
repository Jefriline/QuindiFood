import { Request, Response } from 'express';
import EstablecimientoService from '../../services/EstablecimientoService/establecimientoService';
import { BlobServiceClient, BlobSASPermissions } from '@azure/storage-blob';

const editarEstablecimiento = async (req: Request, res: Response) => {
    try {
        const idUsuario = (req as any).user?.id;
        if (!idUsuario) {
            return res.status(401).json({ success: false, message: 'No autenticado' });
        }

        // Obtener el ID del establecimiento del usuario
        const miEstablecimiento = await EstablecimientoService.getMiEstablecimiento(idUsuario);
        if (!miEstablecimiento) {
            return res.status(404).json({ 
                success: false, 
                message: 'No tienes un establecimiento registrado' 
            });
        }

        const idEstablecimiento = miEstablecimiento.id_establecimiento;
        const { 
            nombre_establecimiento, 
            descripcion, 
            ubicacion, 
            telefono, 
            contacto, 
            FK_id_categoria_estab,
            horarios,
            fotosAEliminar,
            documentacion
        } = req.body;

        // Preparar datos para actualizar
        const datosActualizados: any = {};
        if (nombre_establecimiento !== undefined) datosActualizados.nombre_establecimiento = nombre_establecimiento;
        if (descripcion !== undefined) datosActualizados.descripcion = descripcion;
        if (ubicacion !== undefined) datosActualizados.ubicacion = ubicacion;
        if (telefono !== undefined) datosActualizados.telefono = telefono;
        if (contacto !== undefined) datosActualizados.contacto = contacto;
        if (FK_id_categoria_estab !== undefined) datosActualizados.FK_id_categoria_estab = FK_id_categoria_estab;
        if (horarios !== undefined) datosActualizados.horarios = horarios;

        // Preparar documentación legal
        const nuevaDocumentacion: any = {};
        if (documentacion) {
            if (documentacion.registro_mercantil !== undefined) nuevaDocumentacion.registro_mercantil = documentacion.registro_mercantil;
            if (documentacion.rut !== undefined) nuevaDocumentacion.rut = documentacion.rut;
            if (documentacion.certificado_salud !== undefined) nuevaDocumentacion.certificado_salud = documentacion.certificado_salud;
            if (documentacion.registro_invima !== undefined) nuevaDocumentacion.registro_invima = documentacion.registro_invima;
        }

        // Procesar nuevas fotos si se subieron usando Blob Storage
        let nuevasFotos: string[] = [];
        if (req.files && Array.isArray(req.files)) {
            const blobServiceClient = BlobServiceClient.fromConnectionString(process.env.AZURE_STORAGE_CONECTION_STRING || "");
            const containerClient = blobServiceClient.getContainerClient('images');

            for (const file of req.files) {
                const fileName = `${Date.now()}-${file.originalname}`;
                const blobClient = containerClient.getBlockBlobClient(fileName);
                
                // Subir archivo
                await blobClient.uploadData(file.buffer);
                
                // Generar URL con SAS
                const sasOptions = {
                    permissions: BlobSASPermissions.parse("r"),
                    expiresOn: new Date("2099-12-31")
                };
                const url = await blobClient.generateSasUrl(sasOptions);
                
                nuevasFotos.push(url);
            }
        }

        const resultado = await EstablecimientoService.editarEstablecimiento(
            idEstablecimiento,
            datosActualizados,
            nuevasFotos,
            fotosAEliminar,
            Object.keys(nuevaDocumentacion).length > 0 ? nuevaDocumentacion : undefined
        );

        return res.status(200).json({
            success: true,
            message: 'Establecimiento actualizado exitosamente',
            data: resultado
        });
    } catch (error: any) {
        console.error('Error al editar establecimiento:', error);
        return res.status(500).json({
            success: false,
            message: 'Error al editar el establecimiento',
            error: error?.message || 'Error desconocido'
        });
    }
};

export default editarEstablecimiento; 