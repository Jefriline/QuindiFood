require('dotenv').config();
const fetch = require('node-fetch');

async function crearPlan() {
  try {
    const response = await fetch('https://api.mercadopago.com/preapproval_plan', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.ACCESS_TOKEN_MERCADOPAGO}`
      },
      body: JSON.stringify({
        reason: "Membresía Premium QuindiFood",
        auto_recurring: {
          frequency: 1,
          frequency_type: "months",
          transaction_amount: 25000,
          currency_id: "COP"
        },
        back_url: "https://type-mega-win-enquiry.trycloudflare.com/registro-exitoso"
      })
    });
    const data = await response.json();
    if (response.ok) {
      console.log("Plan creado:", data.id);
      console.log("Plan completo:", data);
    } else {
      console.error("Error al crear el plan:", data);
    }
  } catch (error) {
    console.error(error);
  }
}

async function actualizarBackUrl() {
  const planId = '2c93808497e081eb0197e8e83f4d0380'; // Tu plan_id
  const nuevaUrl = 'https://type-mega-win-enquiry.trycloudflare.com/registro-exitoso';
  try {
    const response = await fetch(`https://api.mercadopago.com/preapproval_plan/${planId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.ACCESS_TOKEN_MERCADOPAGO}`
      },
      body: JSON.stringify({
        back_url: nuevaUrl
      })
    });
    const data = await response.json();
    if (response.ok) {
      console.log('Plan actualizado:', data);
    } else {
      console.error('Error al actualizar el plan:', data);
    }
  } catch (error) {
    console.error(error);
  }
}

crearPlan();
actualizarBackUrl(); 