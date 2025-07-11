import { Request, Response } from 'express';
import EstablecimientoService from '../../services/EstablecimientoService/establecimientoService';
import { getSubscriptionStatus, mercadoPagoConfig } from '../../config/mercadopago-config';

const mercadoPagoWebhook = async (req: Request, res: Response) => {
  try {
    console.log('🔔 Webhook recibido:', {
      headers: req.headers,
      body: req.body,
      query: req.query
    });

    const { type, data, action } = req.body;

    // Solo procesar notificaciones de suscripción (preapproval)
    if (type === 'preapproval') {
      const preapprovalId = data?.id;
      
      if (!preapprovalId) {
        console.error('❌ Webhook: preapproval_id no encontrado en la notificación');
        return res.status(400).send('Bad Request: preapproval_id missing');
      }

      console.log('🔍 Procesando notificación de preapproval:', {
        id: preapprovalId,
        action: action
      });

      try {
        // Consultar el estado de la suscripción en Mercado Pago usando el SDK
        const preapproval = await getSubscriptionStatus(preapprovalId);
        
        console.log('📊 Estado de suscripción obtenido:', {
          id: preapproval.body?.id,
          status: preapproval.body?.status,
          payer_email: preapproval.body?.payer_email
        });

        // Procesar según el estado
        if (preapproval.body) {
          const status = preapproval.body.status;
          
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
              // Necesitamos obtener el ID del establecimiento por preapproval_id
              // Por ahora, solo log el evento. Se puede mejorar más adelante
              console.log('Nota: Implementar desactivación de membresía por preapproval_id');
              break;
              
            case 'paused':
              console.log('⏸️ Suscripción pausada');
              break;
              
            default:
              console.log('❓ Estado de suscripción desconocido:', status);
          }
        }

      } catch (mpError) {
        console.error('❌ Error consultando Mercado Pago:', mpError);
        // No retornar error para evitar reenvíos del webhook
      }
    } else {
      console.log('ℹ️ Webhook ignorado, tipo no es preapproval:', type);
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