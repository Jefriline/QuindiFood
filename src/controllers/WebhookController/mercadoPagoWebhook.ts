import { Request, Response } from 'express';
import EstablecimientoService from '../../services/EstablecimientoService/establecimientoService';
import { getSubscriptionStatus } from '../../config/mercadopago-config';

const mercadoPagoWebhook = async (req: Request, res: Response) => {
  try {
    console.log('🔔 Webhook recibido:', {
      headers: req.headers,
      body: req.body,
      query: req.query
    });

    const { type, data, action } = req.body;

    // Manejar notificaciones de PAGOS SIMPLES (preferencias)
    if (type === 'payment') {
      const paymentId = data?.id;
      
      if (!paymentId) {
        console.error('❌ Webhook: payment_id no encontrado en la notificación');
        return res.status(400).send('Bad Request: payment_id missing');
      }

      console.log('🔍 Procesando notificación de payment:', {
        id: paymentId,
        action: action
      });

      try {
        // Consultar el estado del pago en Mercado Pago
        const fetch = (await import('node-fetch')).default;
        const response = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
          headers: {
            'Authorization': `Bearer ${process.env.ACCESS_TOKEN_MERCADOPAGO}`
          }
        });

        const paymentData = await response.json();
        
        if (response.ok && paymentData) {
          console.log('📊 Estado de pago obtenido:', {
            id: paymentData.id,
            status: paymentData.status,
            external_reference: paymentData.external_reference,
            payer_email: paymentData.payer?.email
          });

          // Procesar según el estado del pago
          switch (paymentData.status) {
            case 'approved':
              console.log('✅ Pago aprobado, activando membresía premium...');
              
              // Extraer ID del establecimiento del external_reference
              if (paymentData.external_reference) {
                const match = paymentData.external_reference.match(/est_(\d+)_premium/);
                if (match) {
                  const establecimientoId = parseInt(match[1]);
                  console.log('🏪 Activando membresía para establecimiento:', establecimientoId);
                  
                  try {
                    await EstablecimientoService.activarMembresiaPorPago(establecimientoId, paymentId);
                    console.log('✅ Membresía activada exitosamente');
                  } catch (activationError) {
                    console.error('❌ Error activando membresía:', activationError);
                  }
                } else {
                  console.error('❌ No se pudo extraer ID del establecimiento del external_reference:', paymentData.external_reference);
                }
              }
              break;
              
            case 'pending':
              console.log('⏳ Pago pendiente, manteniendo estado actual');
              break;
              
            case 'rejected':
            case 'cancelled':
              console.log('❌ Pago rechazado/cancelado, manteniendo membresía inactiva');
              break;
              
            default:
              console.log('❓ Estado de pago desconocido:', paymentData.status);
          }
        } else {
          console.error('❌ Error obteniendo estado de pago:', paymentData);
        }

      } catch (mpError) {
        console.error('❌ Error consultando pago en Mercado Pago:', mpError);
      }
    }
    // Manejar notificaciones de SUSCRIPCIONES (legacy, por si acaso)
    else if (type === 'preapproval') {
      const preapprovalId = data?.id;
      
      if (!preapprovalId) {
        console.error('❌ Webhook: preapproval_id no encontrado en la notificación');
        return res.status(400).send('Bad Request: preapproval_id missing');
      }

      console.log('🔍 Procesando notificación de preapproval (legacy):', {
        id: preapprovalId,
        action: action
      });

      try {
        // Consultar el estado de la suscripción en Mercado Pago usando fetch directo
        const preapprovalResult = await getSubscriptionStatus(preapprovalId);
        
        if (preapprovalResult.success && preapprovalResult.data) {
          console.log('📊 Estado de suscripción obtenido:', {
            id: preapprovalResult.data.id,
            status: preapprovalResult.data.status,
            payer_email: preapprovalResult.data.payer_email
          });

          // Procesar según el estado
          const status = preapprovalResult.data.status;
          
          switch (status) {
            case 'authorized':
            case 'active':
              console.log('✅ Suscripción activada, actualizando establecimiento...');
              await EstablecimientoService.activarMembresiaPorPreapproval(preapprovalId);
              break;
              
            case 'pending':
              console.log('⏳ Suscripción pendiente, manteniendo estado actual');
              break;
              
            case 'cancelled':
              console.log('❌ Suscripción cancelada, desactivando membresía...');
              // Nota: Implementar desactivación de membresía por preapproval_id si es necesario
              console.log('Nota: Implementar desactivación de membresía por preapproval_id');
              break;
              
            case 'paused':
              console.log('⏸️ Suscripción pausada');
              break;
              
            default:
              console.log('❓ Estado de suscripción desconocido:', status);
          }
        } else {
          console.error('❌ Error obteniendo estado de suscripción:', preapprovalResult.error);
        }

      } catch (mpError) {
        console.error('❌ Error consultando Mercado Pago:', mpError);
      }
    } else {
      console.log('ℹ️ Webhook ignorado, tipo no soportado:', type);
    }

    // Siempre responder 200 para evitar reenvíos
    res.status(200).send('OK');
    
  } catch (error) {
    console.error('❌ Error general en webhook Mercado Pago:', error);
    // Aún así responder 200 para evitar reenvíos infinitos
    res.status(200).send('OK');
  }
};

export default mercadoPagoWebhook; 