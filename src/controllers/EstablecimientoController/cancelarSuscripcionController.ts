import { Request, Response } from 'express';
import EstablecimientoService from '../../services/EstablecimientoService/establecimientoService';

const cancelarSuscripcion = async (req: Request, res: Response) => {
    try {
        const FK_id_usuario = (req as any).user?.id;
        if (!FK_id_usuario) {
            return res.status(400).json({
                success: false,
                message: 'No se pudo identificar al usuario.'
            });
        }

        // Obtener el establecimiento del usuario
        const establecimiento = await EstablecimientoService.obtenerPorUsuario(FK_id_usuario);
        if (!establecimiento) {
            return res.status(404).json({
                success: false,
                message: 'No tienes un establecimiento registrado.'
            });
        }

        // Cancelar la suscripción en Mercado Pago si existe preapproval_id
        if (establecimiento.preapproval_id) {
            try {
                const fetch = (await import('node-fetch')).default;
                const response = await fetch(`https://api.mercadopago.com/preapproval/${establecimiento.preapproval_id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${process.env.ACCESS_TOKEN_MERCADOPAGO}`
                    },
                    body: JSON.stringify({
                        status: 'cancelled'
                    })
                });

                const data = await response.json();
                console.log('Respuesta Mercado Pago cancelación:', data);
            } catch (error) {
                console.error('Error al cancelar en Mercado Pago:', error);
                // Continuar con la cancelación local aunque falle la de MP
            }
        }

        // Actualizar el estado de membresía a 'Inactivo' y sincronizar horarios
        const resultado = await EstablecimientoService.actualizarEstadoMembresia(
            establecimiento.id_establecimiento, 
            'Inactivo'
        );

        res.status(200).json({
            success: true,
            message: 'Suscripción premium cancelada exitosamente',
            data: {
                id_establecimiento: establecimiento.id_establecimiento,
                nombre_establecimiento: establecimiento.nombre_establecimiento,
                estado_membresia: 'Inactivo',
                id_estado_membresia: resultado.id_estado_membresia,
                cancelacion_exitosa: true,
                fecha_cancelacion: new Date().toISOString()
            }
        });

    } catch (error) {
        console.error('Error al cancelar suscripción:', error);
        return res.status(500).json({
            success: false,
            message: 'Error interno del servidor al cancelar la suscripción.',
            error: error instanceof Error ? error.message : 'Error desconocido'
        });
    }
};

export default cancelarSuscripcion; 