const fetch = require('node-fetch');
require('dotenv').config();

/**
 * Script para probar el flujo completo de registro premium con Plan ID
 */

console.log('🚀 Probando Flujo Completo - Registro Premium...\n');

const ACCESS_TOKEN = process.env.ACCESS_TOKEN_MERCADOPAGO;
// Plan ID directo (obtenido del script crear-plan-suscripcion)
const PLAN_ID = '2c93808497e081eb0197e8e83f4d0380';

console.log('🔧 Configuración:');
console.log('✅ ACCESS_TOKEN:', ACCESS_TOKEN ? 'Configurado' : 'NO CONFIGURADO');
console.log('✅ PLAN_ID:', PLAN_ID);
console.log('✅ FRONTEND_URL:', process.env.FRONTEND_URL);

if (!ACCESS_TOKEN) {
    console.error('❌ ACCESS_TOKEN_MERCADOPAGO no está configurado');
    process.exit(1);
}

/**
 * Probar suscripción con Plan ID (sin card_token_id)
 */
async function probarSuscripcionSinTarjeta() {
    console.log('\n🧪 Prueba 1: Suscripción con Plan (sin tarjeta)...');
    
    try {
        const subscriptionData = {
            preapproval_plan_id: PLAN_ID,
            reason: "Membresía Premium QuindiFood - Test Establecimiento",
            external_reference: `test-${Date.now()}`,
            payer_email: "TESTUSER923920023@testuser.com",
            back_url: process.env.FRONTEND_URL || "https://front-quindi-food.vercel.app"
        };

        console.log('📤 Datos:', JSON.stringify(subscriptionData, null, 2));

        const response = await fetch('https://api.mercadopago.com/preapproval', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${ACCESS_TOKEN}`
            },
            body: JSON.stringify(subscriptionData)
        });

        const responseText = await response.text();
        console.log('📨 Status:', response.status);
        console.log('📨 Response:', responseText);

        if (response.ok) {
            const data = JSON.parse(responseText);
            console.log('\n✅ Suscripción creada exitosamente!');
            console.log('🆔 ID:', data.id);
            console.log('🌐 Init Point:', data.init_point);
            console.log('📊 Status:', data.status);
            
            // Verificar que el init_point funciona
            if (data.init_point) {
                console.log('\n🔗 URL de pago generada correctamente');
                console.log('💡 Los usuarios serán redirigidos a:', data.init_point);
                return { success: true, data };
            } else {
                console.log('❌ No se generó init_point');
                return { success: false, error: 'No init_point' };
            }
        } else {
            console.error('❌ Error:', response.status);
            try {
                const errorData = JSON.parse(responseText);
                console.error('❌ Detalles:', errorData);
                return { success: false, error: errorData };
            } catch (e) {
                console.error('❌ Response no parseable');
                return { success: false, error: responseText };
            }
        }
    } catch (error) {
        console.error('❌ Error en la prueba:', error.message);
        return { success: false, error: error.message };
    }
}

/**
 * Probar fallback con preferencia simple
 */
async function probarFallbackPreferencia() {
    console.log('\n🧪 Prueba 2: Fallback con Preferencia Simple...');
    
    try {
        const preferenceData = {
            items: [{
                title: 'Membresía Premium QuindiFood - Primer Mes',
                description: 'Acceso premium para establecimiento de prueba',
                quantity: 1,
                unit_price: 25000,
                currency_id: 'COP'
            }],
            payer: {
                email: "TESTUSER923920023@testuser.com"
            },
            back_urls: {
                success: `${process.env.FRONTEND_URL}/registro-exitoso`,
                failure: `${process.env.FRONTEND_URL}/registro-error`,
                pending: `${process.env.FRONTEND_URL}/registro-pendiente`
            },
            auto_return: 'approved',
            external_reference: `test-fallback-${Date.now()}`,
            notification_url: `${process.env.BASE_URL}/webhook/mercadopago`
        };

        console.log('📤 Datos:', JSON.stringify(preferenceData, null, 2));

        const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${ACCESS_TOKEN}`
            },
            body: JSON.stringify(preferenceData)
        });

        const responseText = await response.text();
        console.log('📨 Status:', response.status);
        console.log('📨 Response:', responseText);

        if (response.ok) {
            const data = JSON.parse(responseText);
            console.log('\n✅ Preferencia creada exitosamente!');
            console.log('🆔 ID:', data.id);
            console.log('🌐 Init Point:', data.init_point);
            return { success: true, data };
        } else {
            console.error('❌ Error:', response.status);
            return { success: false, error: responseText };
        }
    } catch (error) {
        console.error('❌ Error en fallback:', error.message);
        return { success: false, error: error.message };
    }
}

/**
 * Verificar Plan ID existe y está activo
 */
async function verificarPlan() {
    console.log('\n🧪 Prueba 0: Verificando Plan ID...');
    
    try {
        const response = await fetch(`https://api.mercadopago.com/preapproval_plan/${PLAN_ID}`, {
            headers: {
                'Authorization': `Bearer ${ACCESS_TOKEN}`
            }
        });

        if (response.ok) {
            const plan = await response.json();
            console.log('✅ Plan encontrado:');
            console.log('📋 Nombre:', plan.reason);
            console.log('📊 Status:', plan.status);
            console.log('💰 Monto:', plan.auto_recurring?.transaction_amount, plan.auto_recurring?.currency_id);
            console.log('🔄 Frecuencia:', plan.auto_recurring?.frequency, plan.auto_recurring?.frequency_type);
            return { success: true, plan };
        } else {
            console.error('❌ Plan no encontrado:', response.status);
            return { success: false, error: 'Plan no encontrado' };
        }
    } catch (error) {
        console.error('❌ Error verificando plan:', error.message);
        return { success: false, error: error.message };
    }
}

/**
 * Ejecutar todas las pruebas
 */
async function ejecutarPruebas() {
    try {
        console.log('🎯 Iniciando pruebas del flujo completo...\n');
        
        // Paso 1: Verificar que el plan existe
        const planResult = await verificarPlan();
        
        if (!planResult.success) {
            console.log('\n❌ El Plan ID no es válido. Verifica la configuración.');
            return;
        }
        
        // Paso 2: Probar suscripción con plan
        const subscriptionResult = await probarSuscripcionSinTarjeta();
        
        // Paso 3: Probar fallback
        const fallbackResult = await probarFallbackPreferencia();
        
        // Resumen
        console.log('\n📋 Resumen de Pruebas:');
        console.log('✅ Plan válido:', planResult.success ? 'SÍ' : 'NO');
        console.log('✅ Suscripción funciona:', subscriptionResult.success ? 'SÍ' : 'NO');
        console.log('✅ Fallback funciona:', fallbackResult.success ? 'SÍ' : 'NO');
        
        if (subscriptionResult.success) {
            console.log('\n🎉 ¡Flujo de suscripción funcionando!');
            console.log('🚀 El backend puede crear suscripciones premium');
            console.log('🔗 Init Point:', subscriptionResult.data.init_point);
            
            console.log('\n📱 Próximos pasos:');
            console.log('1. Configura el frontend con la documentación');
            console.log('2. Prueba el flujo completo desde la web');
            console.log('3. Usa las tarjetas de prueba para validar pagos');
        } else if (fallbackResult.success) {
            console.log('\n⚠️ Suscripciones fallan, pero fallback funciona');
            console.log('🔗 Init Point Fallback:', fallbackResult.data.init_point);
            console.log('💡 El sistema usará preferencias simples como backup');
        } else {
            console.log('\n❌ Ambos métodos fallan');
            console.log('📞 Contacta soporte de Mercado Pago');
        }
        
    } catch (error) {
        console.error('❌ Error general:', error);
    }
}

// Ejecutar pruebas
ejecutarPruebas(); 