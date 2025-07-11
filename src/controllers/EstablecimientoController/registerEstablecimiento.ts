import { Request, Response } from 'express';
import { EstablecimientoDto } from '../../Dto/EstablecimientoDto/establecimientoDto';
import { MultimediaEstablecimientoDto } from '../../Dto/EstablecimientoDto/multimediaEstablecimientoDto';
import { DocumentacionDto } from '../../Dto/EstablecimientoDto/documentacionDto';
import { EstadoMembresiaDto } from '../../Dto/EstablecimientoDto/estadoMembresiaDto';
import EstablecimientoService from '../../services/EstablecimientoService/establecimientoService';
import { BlobServiceClient, BlobSASPermissions } from '@azure/storage-blob';
import UserService from '../../services/userServices/UserService';
import { createSubscriptionWithPlan, mercadoPagoConfig } from '../../config/mercadopago-config';

// Plan ID de suscripción premium (obtenido del script crear-plan-suscripcion)
const PLAN_ID_PREMIUM = '2c93808497e081eb0197e8e83f4d0380';

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
            try {
                console.log('🔄 Iniciando proceso de suscripción premium...');
                
                const userEmail = await UserService.getEmailById(FK_id_usuario);
                console.log('📧 Email del usuario obtenido:', userEmail);
                
                if (!userEmail) {
                    throw new Error('No se pudo obtener el email del usuario');
                }

                // Email para pruebas o real
                const payer_email = mercadoPagoConfig.isTest
                    ? 'TESTUSER923920023@testuser.com' // Email de cuenta de prueba
                    : userEmail;

                console.log('🔧 Configuración Mercado Pago:', {
                    payer_email,
                    isTest: mercadoPagoConfig.isTest,
                    hasToken: !!mercadoPagoConfig.accessToken,
                    planId: PLAN_ID_PREMIUM
                });

                // Verificar que tenemos un Plan ID
                if (!PLAN_ID_PREMIUM) {
                    console.error('❌ MERCADOPAGO_PLAN_ID no está configurado');
                    throw new Error('Plan de suscripción no configurado');
                }

                // Datos para la suscripción usando el Plan ID
                const subscriptionData = {
                    preapproval_plan_id: PLAN_ID_PREMIUM,
                    reason: `Membresía Premium QuindiFood - ${nombre_establecimiento}`,
                    external_reference: `est_${resultado.id_establecimiento}_premium_${Date.now()}`,
                    payer_email,
                    back_url: `${mercadoPagoConfig.frontendUrl}/registro-exitoso`,
                    // Para suscripciones con plan, no necesitamos auto_recurring
                    // La configuración viene del plan
                };

                console.log('📤 Creando suscripción con Plan ID:', JSON.stringify(subscriptionData, null, 2));

                // Crear suscripción usando fetch directo (más confiable)
                const result = await createSubscriptionWithPlan(subscriptionData);
                
                console.log('🔄 Resultado de suscripción:', {
                    success: result.success,
                    hasInitPoint: result.success && !!result.data?.init_point,
                    status: result.success ? result.data?.status : result.status
                });

                if (result.success && result.data?.init_point && result.data?.id) {
                    // Asociar el preapproval_id al establecimiento
                    console.log('🔗 Asociando preapproval_id:', result.data.id, 'al establecimiento:', resultado.id_establecimiento);
                    await EstablecimientoService.asociarPreapprovalId(resultado.id_establecimiento, result.data.id);
                    
                    return res.status(201).json({
                        success: true,
                        message: 'Tu solicitud de establecimiento está en revisión. Completa el pago para activar tu membresía premium.',
                        init_point: result.data.init_point,
                        preferenceId: result.data.id, // Para el frontend con Wallet
                        preapproval_id: result.data.id,
                        payment_type: 'subscription',
                        data: {
                            id_establecimiento: resultado.id_establecimiento,
                            nombre_establecimiento,
                            estado: 'Pendiente',
                            estado_membresia: 'Pendiente de Pago',
                            fotos_subidas: fotosUrls.length,
                            documentos_subidos: Object.keys(documentosUrls).length,
                            precio_mensual: 25000, // Actualizado según el plan
                            moneda: 'COP',
                            plan_id: PLAN_ID_PREMIUM
                        }
                    });
                } else {
                    console.error('❌ Error en suscripción:', result);
                    
                    // Si la suscripción falla, intentar con preferencia simple como fallback
                    console.log('🔄 Intentando fallback con preferencia simple...');
                    
                    const fetch = (await import('node-fetch')).default;
                    const preferenceData = {
                        items: [{
                            title: 'Membresía Premium QuindiFood - Primer Mes',
                            description: `Acceso premium para ${nombre_establecimiento}`,
                            quantity: 1,
                            unit_price: 25000, // Precio actualizado
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
                        external_reference: `est_${resultado.id_establecimiento}_premium_fallback`,
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

                    const fallbackData = await response.json();

                    if (response.ok && fallbackData.init_point && fallbackData.id) {
                        console.log('✅ Fallback con preferencia exitoso');
                        
                        // Guardar el preference_id
                        await EstablecimientoService.asociarPreapprovalId(resultado.id_establecimiento, fallbackData.id);
                        
                        return res.status(201).json({
                            success: true,
                            message: 'Tu solicitud de establecimiento está en revisión. Completa el pago para activar tu membresía premium.',
                            init_point: fallbackData.init_point,
                            preferenceId: fallbackData.id, // Para el frontend con Wallet
                            preference_id: fallbackData.id,
                            payment_type: 'simple',
                            data: {
                                id_establecimiento: resultado.id_establecimiento,
                                nombre_establecimiento,
                                estado: 'Pendiente',
                                estado_membresia: 'Pendiente de Pago',
                                fotos_subidas: fotosUrls.length,
                                documentos_subidos: Object.keys(documentosUrls).length,
                                precio_mensual: 25000,
                                moneda: 'COP'
                            }
                        });
                    } else {
                        console.error('❌ Fallback también falló:', fallbackData);
                        throw new Error('No se pudo crear ni suscripción ni preferencia de pago');
                    }
                }
            } catch (error: any) {
                console.error('❌ Error completo en proceso premium:', error);
                
                // Si ocurre un error, eliminar el registro creado
                try {
                    await EstablecimientoService.eliminarEstablecimientoCompleto(resultado.id_establecimiento, FK_id_usuario, false);
                } catch (cleanupError) {
                    console.error('❌ Error adicional al limpiar registro:', cleanupError);
                }
                
                const errorMessage = error.message || 'Error desconocido al procesar el pago';
                
                return res.status(500).json({
                    success: false,
                    message: `No se pudo iniciar el proceso de pago premium: ${errorMessage}. Verifica tus datos e intenta de nuevo.`
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