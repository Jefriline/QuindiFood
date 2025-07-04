import { Request, Response } from 'express';
import ProductoService from '../../services/ProductoService/productoService';
import { BlobServiceClient, BlobSASPermissions } from '@azure/storage-blob';

const crearProducto = async (req: Request, res: Response) => {
    try {
        const idUsuario = (req as any).user?.id;
        if (!idUsuario) {
            return res.status(401).json({ success: false, message: 'No autenticado' });
        }

        const { nombre, precio, descripcion, FK_id_categoria_producto } = req.body;

        // Validar campos requeridos
        if (!nombre || !precio || !FK_id_categoria_producto) {
            return res.status(400).json({
                success: false,
                message: 'Nombre, precio y categoría son obligatorios'
            });
        }

        if (precio < 0) {
            return res.status(400).json({
                success: false,
                message: 'El precio no puede ser negativo'
            });
        }

        // Procesar archivos multimedia si se subieron
        let multimedia: { tipo: 'foto' | 'video', ref: string }[] = [];
        
        if (req.files && Array.isArray(req.files)) {
            const blobServiceClient = BlobServiceClient.fromConnectionString(process.env.AZURE_STORAGE_CONECTION_STRING || "");
            const containerClient = blobServiceClient.getContainerClient('productos');
            
            // Crear contenedor si no existe
            try {
                await containerClient.createIfNotExists({
                    access: 'blob' // Permite acceso público a los blobs
                });
                console.log('✅ Contenedor "productos" verificado/creado');
            } catch (error) {
                console.log('⚠️ Error verificando contenedor:', error);
            }

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
                
                multimedia.push({ tipo, ref: url });
            }
        }

        const productoData = {
            nombre,
            precio: parseFloat(precio),
            descripcion,
            FK_id_categoria_producto: parseInt(FK_id_categoria_producto),
            multimedia
        };

        const resultado = await ProductoService.crearProducto(productoData, idUsuario);

        return res.status(201).json({
            success: true,
            message: 'Producto creado exitosamente',
            data: resultado
        });
    } catch (error: any) {
        console.error('Error al crear producto:', error);
        return res.status(500).json({
            success: false,
            message: 'Error al crear el producto',
            error: error?.message || 'Error desconocido'
        });
    }
};

export default crearProducto; 