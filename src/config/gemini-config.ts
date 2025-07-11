import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';

const API_KEY = process.env.GEMINI_API_KEY;

if (!API_KEY) {
  throw new Error('GEMINI_API_KEY no está configurada en las variables de entorno');
}

const genAI = new GoogleGenerativeAI(API_KEY);

// Configuración del modelo optimizada para QuindiFood
export const geminiModel = genAI.getGenerativeModel({ 
  model: "gemini-2.0-flash",
  generationConfig: {
    temperature: 0.7, // Más creativo para respuestas naturales
    topK: 40,
    topP: 0.9,
    maxOutputTokens: 2000, // Más espacio para respuestas detalladas
  },
  safetySettings: [
    {
      category: HarmCategory.HARM_CATEGORY_HARASSMENT,
      threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
    },
    {
      category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, 
      threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
    },
    {
      category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
      threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
    },
    {
      category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
      threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
    },
  ],
});

// Contexto súper específico de QuindiFood
export const QUINDIFOOD_CONTEXT = `
Eres QuindiBot 🤖, el asistente gastronómico más inteligente del Quindío. Tu misión es ayudar a encontrar la comida perfecta.

🎯 TU SUPERPODER: Conoces TODOS los productos y establecimientos de QuindiFood en tiempo real.

📊 DATOS DISPONIBLES EN TIEMPO REAL:
- Productos con precios exactos, descripciones, calificaciones
- Establecimientos con ubicaciones, categorías, calificaciones
- Historial de búsquedas y preferencias de usuarios
- Comentarios y reseñas reales de clientes

🔍 CUANDO EL USUARIO PREGUNTE POR COMIDA:
1. SIEMPRE busca en los datos reales proporcionados
2. Si hay productos que coinciden, menciona nombres exactos, precios y establecimientos
3. Si NO hay productos exactos, recomienda alternativas similares de los datos reales
4. NUNCA inventes productos, precios o establecimientos

✅ EJEMPLOS DE RESPUESTAS INTELIGENTES:
- Usuario: "Quiero sushi" → Si hay sushi real: "¡Genial! Encontré Sushi Roll de Salmón en Sushi Master por $28.500"
- Usuario: "Quiero sushi" → Si NO hay sushi: "No tengo sushi específicamente, pero tengo Gohan de Salmón en Sushi Express por $23.000, que es parecido"
- Usuario: "Algo barato" → Muestra los productos más económicos de los datos reales
- Usuario: "Postres" → Muestra helados, dulces, etc. de los datos reales

🚫 NUNCA HAGAS ESTO:
- Inventar productos que no están en los datos
- Dar precios inventados
- Mencionar establecimientos que no existen en los datos
- Ser genérico cuando tienes datos específicos

🎨 PERSONALIDAD:
- Entusiasta y conocedor de la gastronomía quindiamana
- Específico con nombres, precios y ubicaciones
- Conversacional pero preciso
- Menciona calificaciones cuando las tengas
`;

// Función principal para generar contenido optimizada
export const generateAIResponse = async (
  prompt: string, 
  userRole: string, 
  conversationHistory: any[] = []
): Promise<string> => {
  try {
    // Construir historial de conversación
    let conversationContext = '';
    if (conversationHistory.length > 0) {
      conversationContext = '\nHISTORIAL RECIENTE:\n' + 
        conversationHistory.slice(-2).map(msg => 
          `Usuario: ${msg.user_message}\nQuindiBot: ${msg.ai_response}`
        ).join('\n') + '\n';
    }

    // Prompt optimizado para QuindiFood
    const structuredPrompt = `
${QUINDIFOOD_CONTEXT}

${conversationContext}

INFORMACIÓN DE BÚSQUEDA ACTUAL:
${prompt}

INSTRUCCIONES ESPECÍFICAS:
- Analiza los datos de productos y establecimientos proporcionados
- Si encuentras productos que coinciden con la búsqueda, menciónelos específicamente
- Incluye precios exactos, nombres de establecimientos y calificaciones si están disponibles
- Si no hay coincidencias exactas, sugiere alternativas similares de los datos reales
- Sé conversacional pero preciso
- Máximo 300 palabras

RESPUESTA de QuindiBot:`;

    const result = await geminiModel.generateContent(structuredPrompt);
    const response = await result.response;
    let text = response.text();

    // Limpiar y mejorar la respuesta
    const cleanResponse = optimizeResponse(text);
    
    return cleanResponse;
  } catch (error) {
    console.error('Error al generar contenido con Gemini:', error);
    
    // Respuesta de fallback más inteligente
    if (prompt.includes('PRODUCTOS ENCONTRADOS:') || prompt.includes('ESTABLECIMIENTOS ENCONTRADOS:')) {
      return "¡Perfecto! He encontrado varias opciones que podrían interesarte. Déjame mostrarte los mejores resultados basados en tu búsqueda. ¿Te gustaría que profundice en alguna opción específica?";
    }
    
    return 'Lo siento, estoy teniendo problemas técnicos en este momento. ¿Podrías intentar reformular tu consulta? Estoy aquí para ayudarte a encontrar la mejor comida del Quindío.';
  }
};

// Función para optimizar respuestas
const optimizeResponse = (response: string): string => {
  // Remover texto redundante
  let cleanResponse = response
    .replace(/^(QuindiBot:|🤖)/i, '')
    .replace(/\*\*/g, '')
    .trim();
  
  // Asegurar que empiece naturalmente
  if (!cleanResponse.match(/^[¡!Hola|Perfecto|Genial|Claro|Por supuesto]/i)) {
    if (cleanResponse.toLowerCase().includes('encontr')) {
      cleanResponse = '¡Perfecto! ' + cleanResponse;
    } else if (cleanResponse.toLowerCase().includes('recomien')) {
      cleanResponse = '¡Claro! ' + cleanResponse;
    } else {
      cleanResponse = '¡Hola! ' + cleanResponse;
    }
  }
  
  // Limpiar posible información sensible (por seguridad)
  const sensitivePatterns = [
    /database|sql|query|admin|password|token/gi,
  ];
  
  sensitivePatterns.forEach(pattern => {
    cleanResponse = cleanResponse.replace(pattern, '[INFORMACIÓN TÉCNICA]');
  });
  
  return cleanResponse.trim();
};

// Función específica para búsquedas con datos reales
export const generateResponseWithRealData = async (
  userQuery: string,
  productos: any[] = [],
  establecimientos: any[] = [],
  analisisSemantico: any = {},
  conversationHistory: any[] = []
): Promise<string> => {
  try {
    // Construir contexto con datos reales
    const contextWithData = `
CONSULTA DEL USUARIO: "${userQuery}"

ANÁLISIS SEMÁNTICO:
- Intención detectada: ${analisisSemantico.intencion_detectada || 'búsqueda general'}
- Palabras clave: ${analisisSemantico.palabras_clave?.join(', ') || 'ninguna'}
- Nivel de confianza: ${analisisSemantico.nivel_confianza || 0}

PRODUCTOS ENCONTRADOS EN LA BASE DE DATOS (${productos.length} total):
${productos.slice(0, 8).map((p: any, i: number) => {
  const calificacion = p.calificacion_promedio ? `⭐${parseFloat(p.calificacion_promedio).toFixed(1)}` : '';
  return `${i+1}. 🍽️ "${p.nombre}" - $${p.precio} en ${p.nombre_establecimiento} ${calificacion}${p.descripcion ? ` - ${p.descripcion.substring(0, 80)}` : ''}`;
}).join('\n')}

ESTABLECIMIENTOS ENCONTRADOS (${establecimientos.length} total):
${establecimientos.slice(0, 5).map((e: any, i: number) => {
  const calificacion = e.calificacion_promedio ? `⭐${parseFloat(e.calificacion_promedio).toFixed(1)}` : '';
  const productos = e.total_productos ? ` (${e.total_productos} productos)` : '';
  return `${i+1}. 🏪 "${e.nombre_establecimiento}" - ${e.categoria} ${calificacion}${productos} en ${e.ubicacion}`;
}).join('\n')}

INSTRUCCIONES PARA RESPONDER:
1. Si hay productos relevantes, menciona los mejores 2-3 con nombres exactos y precios
2. Si hay establecimientos relevantes, menciona 1-2 con calificaciones
3. Sé específico y útil, no genérico
4. Si no hay resultados exactos, sugiere alternativas de los datos disponibles
5. Menciona ubicaciones si son relevantes
6. Sé conversacional y entusiasta

Responde como QuindiBot, el asistente gastronómico experto:`;

    const result = await geminiModel.generateContent(contextWithData);
    const response = await result.response;
    let text = response.text();

    return optimizeResponse(text);
    
  } catch (error) {
    console.error('Error generando respuesta con datos reales:', error);
    
    // Fallback con datos disponibles
    if (productos.length > 0) {
      const mejorProducto = productos[0];
      return `¡Perfecto! Encontré "${mejorProducto.nombre}" por $${mejorProducto.precio} en ${mejorProducto.nombre_establecimiento}. ${productos.length > 1 ? `También tengo ${productos.length - 1} opciones más.` : ''} ¿Te gustaría más detalles sobre alguna opción?`;
    }
    
    if (establecimientos.length > 0) {
      const mejorEstablecimiento = establecimientos[0];
      return `¡Genial! Te recomiendo ${mejorEstablecimiento.nombre_establecimiento}, que es ${mejorEstablecimiento.categoria} y está ubicado en ${mejorEstablecimiento.ubicacion}. ¿Te gustaría ver qué productos tienen disponibles?`;
    }
    
    return 'No encontré resultados exactos para tu búsqueda, pero puedo ayudarte a explorar otras opciones gastronómicas en QuindiFood. ¿Qué tipo de comida prefieres?';
  }
};

export default geminiModel;