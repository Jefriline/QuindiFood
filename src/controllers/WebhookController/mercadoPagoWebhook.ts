import { Request, Response } from 'express';
import EstablecimientoService from '../../services/EstablecimientoService/establecimientoService';
import fetch from 'node-fetch';

const mercadoPagoWebhook = async (req: Request, res: Response) => {
  try {
    const { type, data } = req.body;

    // Solo procesar notificaciones de suscripción (preapproval)
    if (type === 'preapproval') {
      const preapprovalId = data.id;

      // Consultar el estado de la suscripción en Mercado Pago
      const response = await fetch(`https://api.mercadopago.com/preapproval/${preapprovalId}`, {
        headers: {
          'Authorization': `Bearer ${process.env.ACCESS_TOKEN_MERCADOPAGO}`
        }
      });
      const preapproval = await response.json();

      if (preapproval.status === 'authorized' || preapproval.status === 'active') {
        // Aquí debes buscar el establecimiento relacionado al usuario/preapproval
        // y actualizar la membresía a 'Activo'
        await EstablecimientoService.activarMembresiaPorPreapproval(preapprovalId);
      }
    }

    res.status(200).send('OK');
  } catch (error) {
    console.error('Error en webhook Mercado Pago:', error);
    res.status(500).send('Error');
  }
};

export default mercadoPagoWebhook; 