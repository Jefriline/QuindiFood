import dotenv from 'dotenv';

dotenv.config();

if (!process.env.ACCESS_TOKEN_MERCADOPAGO) {
    console.error('❌ ACCESS_TOKEN_MERCADOPAGO no está configurado en el .env');
    throw new Error('ACCESS_TOKEN_MERCADOPAGO es requerido');
}

// Exportar configuración para usar en otros archivos
export const mercadoPagoConfig = {
    accessToken: process.env.ACCESS_TOKEN_MERCADOPAGO,
    publicKey: process.env.PUBLIC_KEY_MERCADOPAGO || 'TEST-8384b7ba-d929-40f5-be7e-66b9baff119b',
    isTest: true, // Cambiar a false en producción
    baseUrl: 'https://api.mercadopago.com',
    frontendUrl: process.env.FRONTEND_URL || 'https://front-quindi-food.vercel.app',
    backendUrl: process.env.BASE_URL || 'https://quindifoodapi-ggaudmhcdqcehkcp.centralus-01.azurewebsites.net'
};

// Función para crear suscripciones usando fetch directo (más estable)
export const createSubscriptionWithPlan = async (subscriptionData: any) => {
    try {
        const fetch = (await import('node-fetch')).default;
        
        const response = await fetch('https://api.mercadopago.com/preapproval', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${mercadoPagoConfig.accessToken}`
            },
            body: JSON.stringify(subscriptionData)
        });

        const responseText = await response.text();
        
        if (response.ok) {
            return {
                success: true,
                data: JSON.parse(responseText)
            };
        } else {
            console.error('Error en createSubscriptionWithPlan:', response.status, responseText);
            return {
                success: false,
                error: JSON.parse(responseText),
                status: response.status
            };
        }
    } catch (error) {
        console.error('Error en createSubscriptionWithPlan:', error);
        throw error;
    }
};

// Función para cancelar suscripciones usando fetch directo
export const cancelSubscription = async (preapprovalId: string) => {
    try {
        const fetch = (await import('node-fetch')).default;
        
        const response = await fetch(`https://api.mercadopago.com/preapproval/${preapprovalId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${mercadoPagoConfig.accessToken}`
            },
            body: JSON.stringify({
                status: 'cancelled'
            })
        });

        const responseText = await response.text();
        
        if (response.ok) {
            return {
                success: true,
                data: JSON.parse(responseText)
            };
        } else {
            console.error('Error cancelando suscripción:', response.status, responseText);
            return {
                success: false,
                error: JSON.parse(responseText),
                status: response.status
            };
        }
    } catch (error) {
        console.error('Error cancelando suscripción MP:', error);
        throw error;
    }
};

// Función para obtener estado de suscripción usando fetch directo
export const getSubscriptionStatus = async (preapprovalId: string) => {
    try {
        const fetch = (await import('node-fetch')).default;
        
        const response = await fetch(`https://api.mercadopago.com/preapproval/${preapprovalId}`, {
            headers: {
                'Authorization': `Bearer ${mercadoPagoConfig.accessToken}`
            }
        });

        const responseText = await response.text();
        
        if (response.ok) {
            return {
                success: true,
                data: JSON.parse(responseText)
            };
        } else {
            console.error('Error obteniendo estado de suscripción:', response.status, responseText);
            return {
                success: false,
                error: JSON.parse(responseText),
                status: response.status
            };
        }
    } catch (error) {
        console.error('Error obteniendo estado de suscripción MP:', error);
        throw error;
    }
};

console.log('✅ Mercado Pago configurado:', {
    hasAccessToken: !!mercadoPagoConfig.accessToken,
    hasPublicKey: !!mercadoPagoConfig.publicKey,
    isTest: mercadoPagoConfig.isTest
}); 