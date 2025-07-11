const fetch = require('node-fetch');
require('dotenv').config();

/**
 * Script de diagnóstico específico para el error 500 de Mercado Pago
 */

console.log('🔍 Diagnóstico Mercado Pago - Error 500...\n');

// Verificar credenciales
const ACCESS_TOKEN = process.env.ACCESS_TOKEN_MERCADOPAGO;
const PUBLIC_KEY = process.env.PUBLIC_KEY_MERCADOPAGO;

console.log('🔑 Credenciales:');
console.log('ACCESS_TOKEN:', ACCESS_TOKEN ? `${ACCESS_TOKEN.substring(0, 20)}...` : 'NO DEFINIDO');
console.log('PUBLIC_KEY:', PUBLIC_KEY ? `${PUBLIC_KEY.substring(0, 20)}...` : 'NO DEFINIDO');
console.log('Longitud ACCESS_TOKEN:', ACCESS_TOKEN ? ACCESS_TOKEN.length : 0);
console.log('Longitud PUBLIC_KEY:', PUBLIC_KEY ? PUBLIC_KEY.length : 0);

if (!ACCESS_TOKEN) {
    console.error('❌ ACCESS_TOKEN_MERCADOPAGO no está configurado');
    process.exit(1);
}

/**
 * Prueba 1: Verificar que las credenciales sean válidas consultando la información del usuario
 */
async function verificarCredenciales() {
    console.log('\n🧪 Prueba 1: Verificando credenciales...');
    
    try {
        const response = await fetch('https://api.mercadopago.com/users/me', {
            headers: {
                'Authorization': `Bearer ${ACCESS_TOKEN}`
            }
        });

        console.log('Status:', response.status);
        
        if (response.ok) {
            const data = await response.json();
            console.log('✅ Credenciales válidas');
            console.log('📧 Email:', data.email);
            console.log('🌍 País:', data.country_id);
            console.log('🆔 User ID:', data.id);
            console.log('🏪 Site ID:', data.site_id);
            return true;
        } else {
            const errorData = await response.json();
            console.error('❌ Credenciales inválidas:', errorData);
            return false;
        }
    } catch (error) {
        console.error('❌ Error verificando credenciales:', error.message);
        return false;
    }
}

/**
 * Prueba 2: Intentar crear una preferencia simple (no suscripción)
 */
async function probarPreferencia() {
    console.log('\n🧪 Prueba 2: Creando preferencia simple...');
    
    try {
        const preferenceData = {
            items: [{
                title: 'Prueba QuindiFood',
                quantity: 1,
                unit_price: 35000,
                currency_id: 'COP'
            }],
            back_urls: {
                success: `${process.env.FRONTEND_URL}/registro-exitoso`,
                failure: `${process.env.FRONTEND_URL}/registro-error`,
                pending: `${process.env.FRONTEND_URL}/registro-pendiente`
            },
            auto_return: 'approved'
        };

        const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${ACCESS_TOKEN}`
            },
            body: JSON.stringify(preferenceData)
        });

        console.log('Status:', response.status);
        
        if (response.ok) {
            const data = await response.json();
            console.log('✅ Preferencia creada exitosamente');
            console.log('🔗 ID:', data.id);
            console.log('🌐 Init Point:', data.init_point);
            return data;
        } else {
            const errorData = await response.json();
            console.error('❌ Error creando preferencia:', errorData);
            return null;
        }
    } catch (error) {
        console.error('❌ Error en la prueba:', error.message);
        return null;
    }
}

/**
 * Prueba 3: Intentar crear suscripción con datos mínimos
 */
async function probarSuscripcionMinima() {
    console.log('\n🧪 Prueba 3: Creando suscripción con datos mínimos...');
    
    try {
        const subscriptionData = {
            reason: 'Prueba Membresía Premium',
            auto_recurring: {
                frequency: 1,
                frequency_type: "months",
                transaction_amount: 35000,
                currency_id: "COP"
            },
            payer_email: 'TESTUSER923920023@testuser.com',
            back_url: `${process.env.FRONTEND_URL}/registro-exitoso`
        };

        console.log('📤 Datos enviados:', JSON.stringify(subscriptionData, null, 2));

        const response = await fetch('https://api.mercadopago.com/preapproval', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${ACCESS_TOKEN}`
            },
            body: JSON.stringify(subscriptionData)
        });

        console.log('📨 Status Response:', response.status);
        console.log('📨 Headers Response:', Object.fromEntries(response.headers.entries()));

        const responseText = await response.text();
        console.log('📨 Raw Response:', responseText);

        if (response.ok) {
            const data = JSON.parse(responseText);
            console.log('✅ Suscripción creada exitosamente');
            console.log('🔗 ID:', data.id);
            console.log('🌐 Init Point:', data.init_point);
            console.log('📊 Status:', data.status);
            return data;
        } else {
            console.error('❌ Error HTTP:', response.status, response.statusText);
            try {
                const errorData = JSON.parse(responseText);
                console.error('❌ Error Data:', errorData);
            } catch (parseError) {
                console.error('❌ No se pudo parsear error response');
            }
            return null;
        }
    } catch (error) {
        console.error('❌ Error en la prueba:', error.message);
        console.error('Stack:', error.stack);
        return null;
    }
}

/**
 * Prueba 4: Verificar si la cuenta está habilitada para suscripciones
 */
async function verificarCapacidadesCuenta() {
    console.log('\n🧪 Prueba 4: Verificando capacidades de la cuenta...');
    
    try {
        const response = await fetch('https://api.mercadopago.com/users/me', {
            headers: {
                'Authorization': `Bearer ${ACCESS_TOKEN}`
            }
        });

        if (response.ok) {
            const data = await response.json();
            console.log('📊 Información de la cuenta:');
            console.log('- País:', data.country_id);
            console.log('- Tipo de usuario:', data.user_type);
            console.log('- Verificado:', data.status?.list?.immediately_approved);
            console.log('- Sitio:', data.site_id);
            
            // Verificar métodos de pago disponibles
            const paymentMethodsResponse = await fetch(`https://api.mercadopago.com/v1/payment_methods?public_key=${PUBLIC_KEY}`);
            if (paymentMethodsResponse.ok) {
                const paymentMethods = await paymentMethodsResponse.json();
                console.log('💳 Métodos de pago disponibles:', paymentMethods.length);
                console.log('💳 Algunos métodos:', paymentMethods.slice(0, 3).map(pm => pm.id));
            }
            
            return true;
        } else {
            console.error('❌ No se pudo obtener información de la cuenta');
            return false;
        }
    } catch (error) {
        console.error('❌ Error verificando capacidades:', error.message);
        return false;
    }
}

/**
 * Prueba 5: Probar con estructura de datos diferente
 */
async function probarFormatoAlternativo() {
    console.log('\n🧪 Prueba 5: Probando formato alternativo...');
    
    try {
        // Formato más simple
        const subscriptionData = {
            reason: 'Test Subscription',
            external_reference: 'test-ref-' + Date.now(),
            payer_email: 'TESTUSER923920023@testuser.com',
            back_url: `${process.env.FRONTEND_URL}/registro-exitoso`,
            auto_recurring: {
                frequency: 1,
                frequency_type: "months",
                transaction_amount: 35000,
                currency_id: "COP",
                free_trial: {
                    frequency: 1,
                    frequency_type: "months"
                }
            }
        };

        console.log('📤 Datos alternativos:', JSON.stringify(subscriptionData, null, 2));

        const response = await fetch('https://api.mercadopago.com/preapproval', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${ACCESS_TOKEN}`,
                'X-Idempotency-Key': 'test-' + Date.now()
            },
            body: JSON.stringify(subscriptionData)
        });

        const responseText = await response.text();
        console.log('📨 Status:', response.status);
        console.log('📨 Response:', responseText);

        if (response.ok) {
            const data = JSON.parse(responseText);
            console.log('✅ Formato alternativo exitoso');
            return data;
        } else {
            console.error('❌ Formato alternativo falló');
            return null;
        }
    } catch (error) {
        console.error('❌ Error en formato alternativo:', error.message);
        return null;
    }
}

/**
 * Ejecutar todas las pruebas de diagnóstico
 */
async function ejecutarDiagnostico() {
    try {
        console.log('🚀 Iniciando diagnóstico completo...\n');
        
        // Paso 1: Verificar credenciales
        const credencialesValidas = await verificarCredenciales();
        if (!credencialesValidas) {
            console.log('\n❌ Las credenciales no son válidas. Verifica tu ACCESS_TOKEN');
            return;
        }
        
        // Paso 2: Probar preferencia simple
        const preferenciaExitosa = await probarPreferencia();
        
        // Paso 3: Verificar capacidades de la cuenta
        await verificarCapacidadesCuenta();
        
        // Paso 4: Probar suscripción mínima
        const suscripcionExitosa = await probarSuscripcionMinima();
        
        // Paso 5: Si falla, probar formato alternativo
        if (!suscripcionExitosa) {
            await probarFormatoAlternativo();
        }
        
        console.log('\n📋 Resumen del diagnóstico:');
        console.log('✅ Credenciales válidas:', credencialesValidas ? 'SÍ' : 'NO');
        console.log('✅ Preferencias funcionan:', preferenciaExitosa ? 'SÍ' : 'NO');
        console.log('✅ Suscripciones funcionan:', suscripcionExitosa ? 'SÍ' : 'NO');
        
        if (credencialesValidas && preferenciaExitosa && !suscripcionExitosa) {
            console.log('\n🔍 Análisis:');
            console.log('- Las credenciales son válidas ✅');
            console.log('- Las preferencias normales funcionan ✅');
            console.log('- Las suscripciones fallan ❌');
            console.log('\n💡 Posibles causas:');
            console.log('1. Tu cuenta de prueba no tiene habilitadas las suscripciones');
            console.log('2. Faltan campos obligatorios en la petición de suscripción');
            console.log('3. El formato de datos no es el correcto');
            console.log('4. Necesitas activar suscripciones en el panel de Mercado Pago');
            console.log('\n🎯 Recomendación:');
            console.log('- Verifica en tu panel de Mercado Pago si tienes habilitadas las suscripciones');
            console.log('- Contacta al soporte de Mercado Pago para activar suscripciones en tu cuenta de prueba');
        }
        
    } catch (error) {
        console.error('❌ Error general en diagnóstico:', error);
    }
}

// Ejecutar diagnóstico
ejecutarDiagnostico(); 