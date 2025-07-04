import { Request, Response } from 'express';
import EstablecimientoService from '../../services/EstablecimientoService/establecimientoService';
import { BlobServiceClient, BlobSASPermissions } from '@azure/storage-blob';

const editarEstablecimiento = async (req: Request, res: Response) => {
    try {
        const idUsuario = (req as any).user?.id;
        if (!idUsuario) {
            return res.status(401).json({ success: false, message: 'No autenticado' });
        }

        console.log('Datos recibidos en el backend:', {
            body: Object.keys(req.body),
            files: req.files ? (req.files as any[]).map(f => ({ fieldname: f.fieldname, originalname: f.originalname })) : 'No files'
        });

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
            fotosAEliminar
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

        // Configurar Azure Blob Storage
        const blobServiceClient = BlobServiceClient.fromConnectionString(process.env.AZURE_STORAGE_CONECTION_STRING || "");
        
        // Procesar archivos si se subieron
        let nuevasFotos: string[] = [];
        const nuevaDocumentacion: any = {};
        
        if (req.files && Array.isArray(req.files) && req.files.length > 0) {
            for (const file of req.files) {
                const fileName = `${Date.now()}-${file.originalname}`;
                
                // Determinar si es foto o documento según el fieldname
                if (file.fieldname === 'fotos') {
                    // Es una foto del establecimiento
                    const containerClient = blobServiceClient.getContainerClient('images');
                    await containerClient.createIfNotExists({ access: 'blob' });
                    
                    const blobClient = containerClient.getBlockBlobClient(fileName);
                    await blobClient.uploadData(file.buffer);
                    
                    const sasOptions = {
                        permissions: BlobSASPermissions.parse("r"),
                        expiresOn: new Date("2099-12-31")
                    };
                    const url = await blobClient.generateSasUrl(sasOptions);
                    nuevasFotos.push(url);
                    
                } else if (file.fieldname.startsWith('documentacion[') && file.fieldname.endsWith(']')) {
                    // Es un documento legal
                    const docType = file.fieldname.replace('documentacion[', '').replace(']', '');
                    const containerClient = blobServiceClient.getContainerClient('documentos');
                    await containerClient.createIfNotExists({ access: 'blob' });
                    
                    const blobClient = containerClient.getBlockBlobClient(fileName);
                    await blobClient.uploadData(file.buffer);
                    
                    const sasOptions = {
                        permissions: BlobSASPermissions.parse("r"),
                        expiresOn: new Date("2099-12-31")
                    };
                    const url = await blobClient.generateSasUrl(sasOptions);
                    nuevaDocumentacion[docType] = url;
                }
            }
        }

        console.log('Archivos procesados:', {
            fotos: nuevasFotos.length,
            documentos: Object.keys(nuevaDocumentacion)
        });

        const resultado = await EstablecimientoService.editarEstablecimiento(
            idEstablecimiento,
            datosActualizados,
            nuevasFotos,
            fotosAEliminar ? JSON.parse(fotosAEliminar) : undefined,
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