import { Request, Response } from 'express';
import ProductoService from '../../services/ProductoService/productoService';
import { BlobServiceClient, BlobSASPermissions } from '@azure/storage-blob';

const editarProducto = async (req: Request, res: Response) => {
    try {
        const idUsuario = (req as any).user?.id;
        if (!idUsuario) {
            return res.status(401).json({ success: false, message: 'No autenticado' });
        }

        const { id } = req.params;
        if (!id || isNaN(parseInt(id))) {
            return res.status(400).json({ success: false, message: 'ID de producto inválido' });
        }

        const { 
            nombre, 
            precio, 
            descripcion, 
            FK_id_categoria_producto,
            multimediaAEliminar 
        } = req.body;

        // Preparar datos para actualizar
        const datosActualizados: any = {};
        if (nombre !== undefined) datosActualizados.nombre = nombre;
        if (precio !== undefined) {
            if (precio < 0) {
                return res.status(400).json({
                    success: false,
                    message: 'El precio no puede ser negativo'
                });
            }
            datosActualizados.precio = parseFloat(precio);
        }
        if (descripcion !== undefined) datosActualizados.descripcion = descripcion;
        if (FK_id_categoria_producto !== undefined) datosActualizados.FK_id_categoria_producto = parseInt(FK_id_categoria_producto);

        // Procesar archivos multimedia si se subieron
        let nuevaMultimedia: { tipo: 'foto' | 'video', ref: string }[] = [];
        
        if (req.files && Array.isArray(req.files)) {
            const blobServiceClient = BlobServiceClient.fromConnectionString(process.env.AZURE_STORAGE_CONECTION_STRING || "");
            const containerClient = blobServiceClient.getContainerClient('productos');

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
                
                // Determinar tipo basado en extensión
                const extension = file.originalname.toLowerCase().split('.').pop();
                const tipo = ['mp4', 'avi', 'mov', 'wmv'].includes(extension || '') ? 'video' : 'foto';
                
                nuevaMultimedia.push({ tipo, ref: url });
            }
        }

        const resultado = await ProductoService.editarProducto(
            parseInt(id),
            idUsuario,
            datosActualizados,
            nuevaMultimedia,
            multimediaAEliminar
        );

        return res.status(200).json({
            success: true,
            message: 'Producto actualizado exitosamente',
            data: resultado
        });
    } catch (error: any) {
        console.error('Error al editar producto:', error);
        return res.status(500).json({
            success: false,
            message: 'Error al editar el producto',
            error: error?.message || 'Error desconocido'
        });
    }
};

export default editarProducto; 