import { Request, Response } from 'express';
import { EstablecimientoDto } from '../../Dto/EstablecimientoDto/establecimientoDto';
import { MultimediaEstablecimientoDto } from '../../Dto/EstablecimientoDto/multimediaEstablecimientoDto';
import { DocumentacionDto } from '../../Dto/EstablecimientoDto/documentacionDto';
import { EstadoMembresiaDto } from '../../Dto/EstablecimientoDto/estadoMembresiaDto';
import EstablecimientoService from '../../services/EstablecimientoService/establecimientoService';
import { BlobServiceClient, BlobSASPermissions } from '@azure/storage-blob';
import UserService from '../../services/userServices/UserService';
import { mercadoPagoConfig } from '../../config/mercadopago-config';

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

        // VALIDAR: No permitir múltiples registros del mismo usuario
        const establecimientoExistente = await EstablecimientoService.verificarEstablecimientoPorUsuario(FK_id_usuario);
        if (establecimientoExistente) {
            if (establecimientoExistente.estado === 'Pendiente') {
                if (plan === 'premium') {
                    return res.status(400).json({
                        success: false,
                        message: 'Ya tienes un establecimiento premium pendiente de pago. Espera a que se complete o se elimine automáticamente en 3 minutos, o completa el pago actual.'
                    });
                } else {
                    // Si tiene uno pendiente (puede ser gratuito o premium expirado) y quiere registrar gratis
                    await EstablecimientoService.eliminarEstablecimientoCompleto(establecimientoExistente.id_establecimiento, FK_id_usuario, true);
                    console.log(`🗑️ Establecimiento pendiente ${establecimientoExistente.id_establecimiento} reemplazado por nuevo registro`);
                }
            } else if (establecimientoExistente.estado === 'Aprobado') {
                return res.status(400).json({
                    success: false,
                    message: 'Ya tienes un establecimiento registrado y aprobado. Un usuario solo puede tener un establecimiento.'
                });
            }
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
            estadoMembresia = 'Inactivo'; // Mantener inactivo hasta que se procese el pago
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

        // Si es premium, crear una PREFERENCIA SIMPLE en lugar de suscripción
        if (plan === 'premium') {
            try {
                const userEmail = await UserService.getEmailById(FK_id_usuario);
                
                if (!userEmail) {
                    throw new Error('No se pudo obtener el email del usuario');
                }

                // Email para pruebas o real
                const payer_email = mercadoPagoConfig.isTest
                    ? 'TESTUSER923920023@testuser.com' // Email de cuenta de prueba
                    : userEmail;

                // Crear PREFERENCIA SIMPLE (compatible con Wallet)
                const fetch = (await import('node-fetch')).default;
                const preferenceData = {
                    items: [{
                        title: 'Membresía Premium QuindiFood - Primer Mes',
                        description: `Acceso premium para ${nombre_establecimiento}`,
                        quantity: 1,
                        unit_price: 35000,
                        currency_id: 'COP'
                    }],
                    payer: {
                        email: payer_email
                    },
                    back_urls: {
                        success: `${mercadoPagoConfig.frontendUrl}/registro-exitoso`,
                        failure: `${mercadoPagoConfig.frontendUrl}/registro-error`,
                        pending: `${mercadoPagoConfig.frontendUrl}/registro-pendiente`
                    },
                    auto_return: 'approved',
                    external_reference: `est_${resultado.id_establecimiento}_premium_${Date.now()}`,
                    notification_url: `${mercadoPagoConfig.backendUrl}/webhook/mercadopago`
                };

                const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${mercadoPagoConfig.accessToken}`
                    },
                    body: JSON.stringify(preferenceData)
                });

                const data = await response.json();

                if (response.ok && data.init_point && data.id) {
                    // Guardar el preference_id
                    await EstablecimientoService.asociarPreapprovalId(resultado.id_establecimiento, data.id);
                    
                    // PROGRAMAR ELIMINACIÓN AUTOMÁTICA si no se paga en 3 MINUTOS
                    // SOLO para establecimientos PREMIUM porque requieren pago inmediato
                    // Los establecimientos gratuitos no tienen límite de tiempo
                    setTimeout(async () => {
                        try {
                            // Verificar si la membresía fue activada
                            const estadoMembresia = await EstablecimientoService.verificarEstadoMembresia(resultado.id_establecimiento);
                            
                            if (estadoMembresia === 'Inactivo') {
                                await EstablecimientoService.eliminarEstablecimientoCompleto(resultado.id_establecimiento, FK_id_usuario, true);
                                console.log(`⏰ Establecimiento premium ${resultado.id_establecimiento} eliminado por no completar pago en 3 minutos`);
                            }
                        } catch (error) {
                            console.error('Error en verificación automática:', error);
                        }
                    }, 3 * 60 * 1000); // 3 minutos SOLO para premium
                    
                    return res.status(201).json({
                        success: true,
                        message: 'Tu establecimiento está en proceso. Completa el pago ahora para activar tu membresía premium.',
                        init_point: data.init_point,
                        preferenceId: data.id,
                        preference_id: data.id,
                        payment_type: 'simple',
                        data: {
                            id_establecimiento: resultado.id_establecimiento,
                            nombre_establecimiento,
                            estado: 'Pendiente',
                            estado_membresia: 'Inactivo',
                            fotos_subidas: fotosUrls.length,
                            documentos_subidos: Object.keys(documentosUrls).length,
                            precio_mensual: 35000,
                            moneda: 'COP',
                            nota: 'IMPORTANTE: Tienes 3 minutos para completar el pago. Si no pagas, tu registro será eliminado automáticamente.'
                        }
                    });
                } else {
                    throw new Error('No se pudo crear la preferencia de pago');
                }
            } catch (error: any) {
                // Si ocurre un error, eliminar el registro creado
                try {
                await EstablecimientoService.eliminarEstablecimientoCompleto(resultado.id_establecimiento, FK_id_usuario, false);
                } catch (cleanupError) {
                    console.error('Error al limpiar registro:', cleanupError);
                }
                
                return res.status(500).json({
                    success: false,
                    message: 'No se pudo procesar el pago premium. Intenta nuevamente.'
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
                documentos_subidos: Object.keys(documentosUrls).length,
                nota: 'Tu establecimiento gratuito será revisado por nuestro equipo. No hay límite de tiempo para la revisión.'
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