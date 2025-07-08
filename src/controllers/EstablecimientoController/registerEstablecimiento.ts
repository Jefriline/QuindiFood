import { Request, Response } from 'express';
import { EstablecimientoDto } from '../../Dto/EstablecimientoDto/establecimientoDto';
import { MultimediaEstablecimientoDto } from '../../Dto/EstablecimientoDto/multimediaEstablecimientoDto';
import { DocumentacionDto } from '../../Dto/EstablecimientoDto/documentacionDto';
import { EstadoMembresiaDto } from '../../Dto/EstablecimientoDto/estadoMembresiaDto';
import EstablecimientoService from '../../services/EstablecimientoService/establecimientoService';
import { BlobServiceClient, BlobSASPermissions } from '@azure/storage-blob';
import fetch from 'node-fetch';
import UserService from '../../services/userServices/UserService';

const PLAN_ID_PREMIUM = '2c93808497e081eb0197e9430c64038c'; // ID generado por Mercado Pago

const registerEstablecimiento = async (req: Request, res: Response) => {
    try {
        const {
            nombre_establecimiento,
            ubicacion,
            telefono,
            contacto,
            descripcion,
            FK_id_categoria_estab,
            horarios,
            plan
        } = req.body;

        // Tomar el id del usuario autenticado directamente
        const FK_id_usuario = (req as any).user?.id;
        if (!FK_id_usuario) {
            return res.status(400).json({
                success: false,
                message: 'No se pudo identificar al usuario que registra el establecimiento.'
            });
        }

        // Validar que se hayan subido los documentos requeridos
        if (!req.files) {
            return res.status(400).json({
                success: false,
                message: 'Debe subir todos los documentos requeridos (PDF) y al menos una foto del establecimiento'
            });
        }

        const files = req.files as any;
        
        // Validar documentos PDF requeridos
        const documentosRequeridos = [
            'documento_registro_mercantil',
            'documento_rut', 
            'documento_certificado_salud'
        ];

        for (const doc of documentosRequeridos) {
            if (!files[doc] || files[doc].length === 0) {
                return res.status(400).json({
                    success: false,
                    message: `El documento ${doc.replace('documento_', '')} es obligatorio`
                });
            }
        }

        // Validar al menos una foto
        if (!files.foto_establecimiento || files.foto_establecimiento.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Debe subir al menos una foto del establecimiento'
            });
        }

        // Subir documentos a blob storage
        const connectionString = process.env.AZURE_STORAGE_CONECTION_STRING;
        if (!connectionString) {
            throw new Error('Azure Storage connection string is not defined');
        }

        const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
        const containerClient = blobServiceClient.getContainerClient('documentos');
        await containerClient.createIfNotExists();
        
        const documentosUrls: any = {};
        
        // Subir cada documento PDF
        for (const doc of documentosRequeridos) {
            const file = files[doc][0];
            const blobClient = containerClient.getBlockBlobClient(file.originalname);
            await blobClient.uploadData(file.buffer);
            
            const sasOptions = {
                permissions: BlobSASPermissions.parse('r'),
                expiresOn: new Date('2099-12-31')
            };
            
            const viewUrl = await blobClient.generateSasUrl(sasOptions);
            documentosUrls[doc.replace('documento_', '')] = viewUrl;
        }

        // Subir registro_invima si existe
        if (files.documento_registro_invima && files.documento_registro_invima.length > 0) {
            const file = files.documento_registro_invima[0];
            const blobClient = containerClient.getBlockBlobClient(file.originalname);
            await blobClient.uploadData(file.buffer);
            
            const sasOptions = {
                permissions: BlobSASPermissions.parse('r'),
                expiresOn: new Date('2099-12-31')
            };
            
            const viewUrl = await blobClient.generateSasUrl(sasOptions);
            documentosUrls['registro_invima'] = viewUrl;
        } else {
            documentosUrls['registro_invima'] = null;
        }

        // Subir fotos del establecimiento
        const fotosUrls: string[] = [];
        const fotosContainer = blobServiceClient.getContainerClient('images');
        
        for (const foto of files.foto_establecimiento) {
            const blobClient = fotosContainer.getBlockBlobClient(foto.originalname);
            await blobClient.uploadData(foto.buffer);
            
            const sasOptions = {
                permissions: BlobSASPermissions.parse('r'),
                expiresOn: new Date('2099-12-31')
            };
            
            const viewUrl = await blobClient.generateSasUrl(sasOptions);
            fotosUrls.push(viewUrl);
        }

        // Crear el DTO principal con la información básica
        const establecimiento = new EstablecimientoDto(
            nombre_establecimiento,
            ubicacion,
            telefono,
            contacto,
            descripcion,
            FK_id_categoria_estab,
            FK_id_usuario
        );

        // Crear los DTOs específicos
        const multimediaDto = new MultimediaEstablecimientoDto(fotosUrls);
        const documentacionDto = new DocumentacionDto(
            documentosUrls.registro_mercantil,
            documentosUrls.rut,
            documentosUrls.certificado_salud,
            documentosUrls.registro_invima
        );
        
        // Estado de membresía por defecto: Inactivo (gratuito)
        let estadoMembresia = 'Inactivo';
        if (plan === 'premium') {
            estadoMembresia = 'Activo';
        }
        const estadoMembresiaDto = new EstadoMembresiaDto(estadoMembresia);

        // Parsear el campo horarios
        let horariosArray = [];
        if (typeof horarios === 'string') {
            try {
                horariosArray = JSON.parse(horarios);
            } catch (e) {
                // Si el usuario envía un string mal formado
                return res.status(400).json({
                    success: false,
                    message: 'El campo horarios debe ser un JSON válido'
                });
            }
        } else if (Array.isArray(horarios)) {
            horariosArray = horarios;
        } else {
            horariosArray = [];
        }

        // Enviar todos los DTOs al servicio
        const resultado = await EstablecimientoService.add(
            establecimiento,
            multimediaDto,
            documentacionDto,
            estadoMembresiaDto,
            horariosArray
        );

        // Si es premium, crear la suscripción en Mercado Pago y devolver el init_point
        if (plan === 'premium') {
            // Obtener email del usuario autenticado por su id
            const userEmail = await UserService.getEmailById(FK_id_usuario);
            try {
                const isTest = 'true'; 

                const payer_email = isTest
                    ? 'TESTUSER923920023@testuser.com' // correo de prueba comprador Mercado Pago
                    : userEmail; // correo real del usuario

                const response = await fetch('https://api.mercadopago.com/preapproval', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${process.env.ACCESS_TOKEN_MERCADOPAGO}`
                    },
                    body: JSON.stringify({
                        payer_email,
                        back_url: "https://type-mega-win-enquiry.trycloudflare.com/registro-exitoso",
                        reason: 'Membresía Premium QuindiFood',
                        auto_recurring: {
                            frequency: 1,
                            frequency_type: "months",
                            transaction_amount: 35000, // o el valor de tu membresía
                            currency_id: "COP"
                        }
                    })
                });
                const data = await response.json();
                console.log('Respuesta Mercado Pago preapproval:', data);
                if (response.ok && data.init_point && data.id) {
                    // Asociar el preapproval_id al establecimiento
                    await EstablecimientoService.asociarPreapprovalId(resultado.id_establecimiento, data.id);
                    return res.status(201).json({
                        success: true,
                        message: 'Tu solicitud de establecimiento está en revisión. Pronto recibirás una respuesta del equipo de QuindiFood.',
                        init_point: data.init_point,
                        data: {
                            id_establecimiento: resultado.id_establecimiento,
                            nombre_establecimiento,
                            estado: 'Pendiente',
                            estado_membresia: 'Activo',
                            fotos_subidas: fotosUrls.length,
                            documentos_subidos: Object.keys(documentosUrls).length
                        }
                    });
                } else {
                    // Si falla la creación de la suscripción, eliminar el registro creado
                    await EstablecimientoService.eliminarEstablecimientoCompleto(resultado.id_establecimiento, FK_id_usuario, false);
                    return res.status(500).json({
                        success: false,
                        message: 'No se pudo iniciar el proceso de pago premium. Intenta de nuevo o contacta soporte.'
                    });
                }
            } catch (error) {
                // Si ocurre un error, eliminar el registro creado
                await EstablecimientoService.eliminarEstablecimientoCompleto(resultado.id_establecimiento, FK_id_usuario, false);
                return res.status(500).json({
                    success: false,
                    message: 'No se pudo iniciar el proceso de pago premium. Intenta de nuevo o contacta soporte.'
                });
            }
        }

        // Si es gratis o cualquier otro caso
        return res.status(201).json({
            success: true,
            message: 'Tu solicitud de establecimiento está en revisión. Pronto recibirás una respuesta del equipo de QuindiFood.',
            data: {
                id_establecimiento: resultado.id_establecimiento,
                nombre_establecimiento,
                estado: 'Pendiente',
                estado_membresia: 'Inactivo',
                fotos_subidas: fotosUrls.length,
                documentos_subidos: Object.keys(documentosUrls).length
            }
        });
    } catch (error) {
        console.error('Error al registrar establecimiento:', error);
        return res.status(500).json({
            success: false,
            message: 'Error al registrar el establecimiento',
            error: error instanceof Error ? error.message : 'Error desconocido'
        });
    }
};

export default registerEstablecimiento; 