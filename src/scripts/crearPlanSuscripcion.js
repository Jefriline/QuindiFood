const fetch = require('node-fetch');
require('dotenv').config();

/**
 * Script para crear un plan de suscripción según la documentación oficial de Mercado Pago
 */

console.log('📋 Creando Plan de Suscripción para QuindiFood...\n');

const ACCESS_TOKEN = process.env.ACCESS_TOKEN_MERCADOPAGO;

if (!ACCESS_TOKEN) {
    console.error('❌ ACCESS_TOKEN_MERCADOPAGO no está configurado');
    process.exit(1);
}

/**
 * Crear plan de suscripción
 */
async function crearPlanSuscripcion() {
    console.log('🏗️ Creando plan de suscripción...');
    
    try {
        const planData = {
            reason: "Membresía Premium QuindiFood - Establecimientos",
            auto_recurring: {
                frequency: 1,
                frequency_type: "months",
                repetitions: 12, // 12 meses máximo
                billing_day_proportional: false,
                transaction_amount: 35000,
                currency_id: "COP"
            },
            payment_methods_allowed: {
                payment_types: [
                    { id: "credit_card" },
                    { id: "debit_card" },
                    { id: "account_money" }
                ]
            },
            back_url: process.env.FRONTEND_URL || "https://front-quindi-food.vercel.app"
        };

        console.log('📤 Datos del plan:', JSON.stringify(planData, null, 2));

        const response = await fetch('https://api.mercadopago.com/preapproval_plan', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${ACCESS_TOKEN}`
            },
            body: JSON.stringify(planData)
        });

        console.log('📨 Status:', response.status);
        
        const responseText = await response.text();
        console.log('📨 Raw Response:', responseText);

        if (response.ok) {
            const data = JSON.parse(responseText);
            console.log('\n✅ Plan creado exitosamente!');
            console.log('🆔 Plan ID:', data.id);
            console.log('🌐 Init Point:', data.init_point);
            console.log('📊 Status:', data.status);
            console.log('💰 Monto:', data.auto_recurring.transaction_amount);
            console.log('🔄 Frecuencia:', data.auto_recurring.frequency, data.auto_recurring.frequency_type);
            
            // Guardar el ID del plan para usarlo en el backend
            console.log('\n📝 IMPORTANTE: Guarda este Plan ID en tu backend:');
            console.log(`const PLAN_ID_PREMIUM = '${data.id}';`);
            
            return data;
        } else {
            console.error('❌ Error creando plan:', response.status);
            try {
                const errorData = JSON.parse(responseText);
                console.error('❌ Error details:', errorData);
            } catch (e) {
                console.error('❌ Response no parseable:', responseText);
            }
            return null;
        }
    } catch (error) {
        console.error('❌ Error en la creación del plan:', error.message);
        return null;
    }
}

/**
 * Probar creación de suscripción con el plan
 */
async function probarSuscripcionConPlan(planId) {
    console.log('\n🧪 Probando suscripción con plan creado...');
    
    try {
        const subscriptionData = {
            preapproval_plan_id: planId,
            reason: "Membresía Premium QuindiFood - Establecimiento Test",
            external_reference: `test-${Date.now()}`,
            payer_email: "TESTUSER923920023@testuser.com",
            back_url: process.env.FRONTEND_URL || "https://front-quindi-food.vercel.app"
        };

        console.log('📤 Datos de suscripción:', JSON.stringify(subscriptionData, null, 2));

        const response = await fetch('https://api.mercadopago.com/preapproval', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${ACCESS_TOKEN}`
            },
            body: JSON.stringify(subscriptionData)
        });

        console.log('📨 Status:', response.status);
        
        const responseText = await response.text();
        console.log('📨 Raw Response:', responseText);

        if (response.ok) {
            const data = JSON.parse(responseText);
            console.log('\n✅ Suscripción con plan creada exitosamente!');
            console.log('🆔 Subscription ID:', data.id);
            console.log('🌐 Init Point:', data.init_point);
            console.log('📊 Status:', data.status);
            console.log('📋 Plan ID:', data.preapproval_plan_id);
            
            return data;
        } else {
            console.error('❌ Error creando suscripción con plan:', response.status);
            try {
                const errorData = JSON.parse(responseText);
                console.error('❌ Error details:', errorData);
            } catch (e) {
                console.error('❌ Response no parseable:', responseText);
            }
            return null;
        }
    } catch (error) {
        console.error('❌ Error en la suscripción con plan:', error.message);
        return null;
    }
}

/**
 * Listar planes existentes
 */
async function listarPlanesExistentes() {
    console.log('\n📋 Listando planes existentes...');
    
    try {
        const response = await fetch('https://api.mercadopago.com/preapproval_plan/search', {
            headers: {
                'Authorization': `Bearer ${ACCESS_TOKEN}`
            }
        });

        if (response.ok) {
            const data = await response.json();
            console.log('📊 Planes encontrados:', data.results?.length || 0);
            
            if (data.results && data.results.length > 0) {
                data.results.forEach((plan, index) => {
                    console.log(`\n${index + 1}. ${plan.reason}`);
                    console.log(`   ID: ${plan.id}`);
                    console.log(`   Status: ${plan.status}`);
                    console.log(`   Monto: ${plan.auto_recurring?.transaction_amount} ${plan.auto_recurring?.currency_id}`);
                    console.log(`   Frecuencia: ${plan.auto_recurring?.frequency} ${plan.auto_recurring?.frequency_type}`);
                });
                
                return data.results;
            } else {
                console.log('📝 No se encontraron planes existentes');
                return [];
            }
        } else {
            console.log('⚠️ No se pudieron listar los planes');
            return [];
        }
    } catch (error) {
        console.error('❌ Error listando planes:', error.message);
        return [];
    }
}

/**
 * Ejecutar proceso completo
 */
async function ejecutarCreacionPlan() {
    try {
        console.log('🚀 Iniciando proceso de creación de plan...\n');
        
        // Paso 1: Listar planes existentes
        const planesExistentes = await listarPlanesExistentes();
        
        // Paso 2: Buscar si ya existe un plan para QuindiFood
        const planExistente = planesExistentes.find(plan => 
            plan.reason && plan.reason.includes('QuindiFood') && plan.status === 'active'
        );
        
        let planId = null;
        
        if (planExistente) {
            console.log(`\n✅ Ya existe un plan activo: ${planExistente.id}`);
            console.log(`📋 Nombre: ${planExistente.reason}`);
            planId = planExistente.id;
        } else {
            // Paso 3: Crear nuevo plan si no existe
            const nuevoPlan = await crearPlanSuscripcion();
            if (nuevoPlan) {
                planId = nuevoPlan.id;
            }
        }
        
        // Paso 4: Probar suscripción con el plan
        if (planId) {
            await probarSuscripcionConPlan(planId);
            
            console.log('\n🎉 Proceso completado exitosamente!');
            console.log('\n📝 Próximos pasos:');
            console.log(`1. Actualiza tu backend con el Plan ID: ${planId}`);
            console.log('2. Modifica el controller para usar preapproval_plan_id');
            console.log('3. Prueba el flujo completo desde el frontend');
        } else {
            console.log('\n❌ No se pudo crear o encontrar un plan válido');
        }
        
    } catch (error) {
        console.error('❌ Error general:', error);
    }
}

// Ejecutar el proceso
ejecutarCreacionPlan(); 