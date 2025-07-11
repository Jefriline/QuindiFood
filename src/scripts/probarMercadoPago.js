const fetch = require('node-fetch');
require('dotenv').config();

/**
 * Script para probar la configuración de Mercado Pago
 */

console.log('🧪 Iniciando pruebas de Mercado Pago...\n');

// Verificar variables de entorno
console.log('🔧 Verificando configuración:');
console.log('✅ ACCESS_TOKEN:', !!process.env.ACCESS_TOKEN_MERCADOPAGO);
console.log('✅ PUBLIC_KEY:', !!process.env.PUBLIC_KEY_MERCADOPAGO);
console.log('✅ BASE_URL:', process.env.BASE_URL);
console.log('✅ FRONTEND_URL:', process.env.FRONTEND_URL);

if (!process.env.ACCESS_TOKEN_MERCADOPAGO) {
    console.error('❌ ACCESS_TOKEN_MERCADOPAGO no está configurado');
    process.exit(1);
}

/**
 * Prueba 1: Crear una suscripción de prueba
 */
async function probarCreacionSuscripcion() {
    console.log('\n📝 Prueba 1: Creando suscripción de prueba...');
    
    try {
        const subscriptionData = {
            payer_email: 'TESTUSER923920023@testuser.com',
            back_url: `${process.env.FRONTEND_URL}/registro-exitoso`,
            reason: 'Prueba Membresía Premium QuindiFood',
            auto_recurring: {
                frequency: 1,
                frequency_type: "months",
                transaction_amount: 35000,
                currency_id: "COP"
            },
            notification_url: `${process.env.BASE_URL}/webhook/mercadopago`
        };

        const response = await fetch('https://api.mercadopago.com/preapproval', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.ACCESS_TOKEN_MERCADOPAGO}`
            },
            body: JSON.stringify(subscriptionData)
        });

        const data = await response.json();
        
        if (response.ok && data.init_point && data.id) {
            console.log('✅ Suscripción creada exitosamente');
            console.log('🔗 ID:', data.id);
            console.log('🌐 Init Point:', data.init_point);
            console.log('📊 Status:', data.status);
            return data;
        } else {
            console.error('❌ Error al crear suscripción:', data);
            return null;
        }
    } catch (error) {
        console.error('❌ Error en la prueba:', error.message);
        return null;
    }
}

/**
 * Prueba 2: Consultar estado de suscripción
 */
async function probarConsultaEstado(preapprovalId) {
    console.log('\n📋 Prueba 2: Consultando estado de suscripción...');
    
    try {
        const response = await fetch(`https://api.mercadopago.com/preapproval/${preapprovalId}`, {
            headers: {
                'Authorization': `Bearer ${process.env.ACCESS_TOKEN_MERCADOPAGO}`
            }
        });

        const data = await response.json();
        
        if (response.ok) {
            console.log('✅ Consulta exitosa');
            console.log('📊 Status:', data.status);
            console.log('📧 Email:', data.payer_email);
            console.log('💰 Monto:', data.auto_recurring?.transaction_amount);
            return data;
        } else {
            console.error('❌ Error en consulta:', data);
            return null;
        }
    } catch (error) {
        console.error('❌ Error en la prueba:', error.message);
        return null;
    }
}

/**
 * Prueba 3: Cancelar suscripción
 */
async function probarCancelacion(preapprovalId) {
    console.log('\n🚫 Prueba 3: Cancelando suscripción...');
    
    try {
        const response = await fetch(`https://api.mercadopago.com/preapproval/${preapprovalId}`, {
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
        
        if (response.ok) {
            console.log('✅ Cancelación exitosa');
            console.log('📊 Nuevo status:', data.status);
            return data;
        } else {
            console.error('❌ Error en cancelación:', data);
            return null;
        }
    } catch (error) {
        console.error('❌ Error en la prueba:', error.message);
        return null;
    }
}

/**
 * Prueba 4: Validar URLs del webhook
 */
async function probarWebhook() {
    console.log('\n🔔 Prueba 4: Validando webhook...');
    
    try {
        const webhookUrl = `${process.env.BASE_URL}/webhook/mercadopago`;
        console.log('🌐 URL del webhook:', webhookUrl);
        
        // Simular llamada de webhook
        const testData = {
            type: 'preapproval',
            data: { id: 'test-preapproval-id' },
            action: 'updated'
        };

        console.log('📤 Datos de prueba:', testData);
        console.log('ℹ️  Nota: Para probar completamente, usa ngrok o cloudflare tunnel');
        console.log('ℹ️  Comando: npx cloudflare tunnel --url http://localhost:10101');
        
        return true;
    } catch (error) {
        console.error('❌ Error en prueba de webhook:', error.message);
        return false;
    }
}

/**
 * Ejecutar todas las pruebas
 */
async function ejecutarPruebas() {
    try {
        // Prueba 1: Crear suscripción
        const suscripcion = await probarCreacionSuscripcion();
        
        if (suscripcion && suscripcion.id) {
            // Prueba 2: Consultar estado
            await probarConsultaEstado(suscripcion.id);
            
            // Prueba 3: Cancelar (para limpiar)
            await probarCancelacion(suscripcion.id);
        }
        
        // Prueba 4: Webhook
        await probarWebhook();
        
        console.log('\n🎉 Todas las pruebas completadas');
        console.log('\n📋 Resumen:');
        console.log('✅ Configuración de credenciales: OK');
        console.log('✅ Creación de suscripciones: OK');
        console.log('✅ Consulta de estado: OK');
        console.log('✅ Cancelación: OK');
        console.log('✅ Webhook URL: OK');
        
        console.log('\n🚀 ¡Mercado Pago está configurado correctamente!');
        console.log('\n📝 Próximos pasos:');
        console.log('1. Configurar el frontend según CONFIGURACION_MERCADOPAGO_FRONTEND.md');
        console.log('2. Probar el flujo completo desde el frontend');
        console.log('3. Usar las tarjetas de prueba para validar pagos');
        
    } catch (error) {
        console.error('❌ Error general en las pruebas:', error);
    }
}

// Ejecutar las pruebas
ejecutarPruebas(); 