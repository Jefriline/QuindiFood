import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';

const API_KEY = process.env.GEMINI_API_KEY;

if (!API_KEY) {
  throw new Error('GEMINI_API_KEY no está configurada en las variables de entorno');
}

const genAI = new GoogleGenerativeAI(API_KEY);

// Configuración del modelo con parámetros de seguridad
export const geminiModel = genAI.getGenerativeModel({ 
  model: "gemini-2.0-flash",
  generationConfig: {
    temperature: 0.3, // Respuestas más consistentes y menos creativas
    topK: 20,
    topP: 0.8,
    maxOutputTokens: 1000, // Limitar longitud de respuestas
  },
  safetySettings: [
    {
      category: HarmCategory.HARM_CATEGORY_HARASSMENT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, 
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
  ],
});

// Contexto base del sistema QuindiFood
export const QUINDIFOOD_CONTEXT = `
Eres un asistente de IA especializado en QuindiFood, una plataforma gastronómica del Quindío, Colombia.

MISIÓN: Brindar visibilidad a establecimientos gastronómicos del Quindío, promoviendo competencia justa entre restaurantes consolidados y emergentes.

INFORMACIÓN DEL SISTEMA:
- Plataforma que centraliza restaurantes, menús, promociones, horarios del Quindío
- Ayuda a transformación digital del sector gastronómico
- Impulsa economía local y fortalece tejido empresarial
- Solo incluye establecimientos que cumplen requisitos legales

FUNCIONALIDADES PRINCIPALES:
1. Búsqueda de establecimientos por categoría, precio, etc  
2. Visualización de productos con precios e imágenes
3. Sistema de calificaciones y comentarios
4. Promociones y eventos gastronómicos
5. Favoritos 

RESTRICCIONES IMPORTANTES:
- SOLO hablar sobre gastronomía, restaurantes, comida del Quindío
- NO proporcionar información médica, legal, financiera personal
- NO responder sobre otros temas fuera de QuindiFood
- SIEMPRE mantener el contexto gastronómico del Quindío
- VALIDAR que el usuario esté autenticado antes de procesar
- Si pregunta algo fuera del contexto, redirigir cortésmente a temas gastronómicos

DATOS DISPONIBLES:
- Establecimientos con categorías (comida rápida, cafeterías, etc.)
- Productos con nombres, precios, descripciones, imágenes
- Ubicaciones en el Quindío
- Horarios de atención
- Calificaciones y comentarios de usuarios
- Promociones activas
`;

// Tipos de respuestas permitidas para clientes
export const CLIENT_ALLOWED_TOPICS = [
  'busqueda_productos',
  'recomendaciones_gastronomicas', 
  'informacion_establecimiento',
  'ayuda_navegacion',
  'terminos_condiciones',
  'como_usar_app',
  'promociones_eventos'
];

// Función para validar si el tema está permitido
export const isTopicAllowed = (userInput: string, userRole: string): boolean => {
  const lowerInput = userInput.toLowerCase();
  
  // Palabras clave no permitidas
  const forbiddenKeywords = [
    'medicina', 'salud', 'enfermedad', 'legal', 'abogado', 'dinero', 
    'banco', 'préstamo', 'política', 'religión', 'sexo', 'drogas',
    'hacker', 'programación', 'código', 'base de datos'
  ];
  
  // Palabras clave gastronómicas permitidas
  const allowedKeywords = [
    'comida', 'restaurante', 'menú', 'precio', 'ubicación', 'quindío',
    'plato', 'bebida', 'postre', 'almuerzo', 'desayuno', 'cena',
    'reserva', 'delivery', 'takeaway', 'promoción', 'descuento'
  ];
  
  // Si es cliente, verificar restricciones más estrictas
  if (userRole === 'cliente') {
    const hasForbidden = forbiddenKeywords.some(keyword => lowerInput.includes(keyword));
    const hasAllowed = allowedKeywords.some(keyword => lowerInput.includes(keyword));
    
    return !hasForbidden && (hasAllowed || lowerInput.includes('quindifood') || lowerInput.includes('ayuda'));
  }
  
  return true; // Administradores tienen más flexibilidad
};

// Función principal para generar contenido con validaciones
export const generateAIResponse = async (
  prompt: string, 
  userRole: string, 
  conversationHistory: any[] = []
): Promise<string> => {
  try {
    // Validar que el tema esté permitido
    if (!isTopicAllowed(prompt, userRole)) {
      return "Lo siento, solo puedo ayudarte con temas relacionados a gastronomía y restaurantes del Quindío. ¿Te gustaría que te recomiende algún plato o restaurante en particular?";
    }

    // Construir historial de conversación
    let conversationContext = '';
    if (conversationHistory.length > 0) {
      conversationContext = '\nHISTORIAL DE CONVERSACIÓN:\n' + 
        conversationHistory.slice(-3).map(msg => 
          `Usuario: ${msg.user_message}\nAsistente: ${msg.ai_response}`
        ).join('\n') + '\n';
    }

    // Prompt estructurado con contexto y restricciones
    const structuredPrompt = `
${QUINDIFOOD_CONTEXT}

${conversationContext}

USUARIO ACTUAL: ${userRole}
NUEVA CONSULTA: ${prompt}

INSTRUCCIONES DE RESPUESTA:
- Responde ÚNICAMENTE sobre gastronomía del Quindío
- Sé útil, conciso y amigable
- Si no tienes información específica, ofrece ayuda general sobre la plataforma
- Si el usuario pregunta algo fuera del contexto, redirige cortésmente
- Máximo 200 palabras
- Usa lenguaje colombiano natural

RESPUESTA:`;

    const result = await geminiModel.generateContent(structuredPrompt);
    const response = await result.response;
    let text = response.text();

    // Validar que la respuesta no contenga información no deseada
    const cleanResponse = sanitizeResponse(text);
    
    return cleanResponse;
  } catch (error) {
    console.error('Error al generar contenido con Gemini:', error);
    throw new Error('Error del servicio de IA. Por favor intenta de nuevo.');
  }
};

// Función para limpiar y validar respuestas
const sanitizeResponse = (response: string): string => {
  // Eliminar información sensible si aparece
  const sensitivePatterns = [
    /api[_\s]?key/gi,
    /password/gi,
    /token/gi,
    /database/gi,
    /sql/gi,
    /admin/gi
  ];
  
  let cleanResponse = response;
  sensitivePatterns.forEach(pattern => {
    cleanResponse = cleanResponse.replace(pattern, '[INFORMACIÓN RESTRINGIDA]');
  });
  
  // Asegurar que la respuesta sea sobre gastronomía
  if (!cleanResponse.toLowerCase().includes('comida') && 
      !cleanResponse.toLowerCase().includes('restaurante') && 
      !cleanResponse.toLowerCase().includes('quindío') &&
      !cleanResponse.toLowerCase().includes('quindifood') &&
      !cleanResponse.toLowerCase().includes('gastronomía')) {
    return "Disculpa, solo puedo ayudarte con información gastronómica del Quindío. ¿Qué tipo de comida te interesa?";
  }
  
  return cleanResponse.trim();
};

// Función específica para búsquedas de productos
export const searchProductsWithAI = async (
  searchQuery: string,
  userPreferences: any = {},
  productos: any[] = []
): Promise<any> => {
  try {
    const searchPrompt = `
Analiza esta búsqueda de productos gastronómicos: "${searchQuery}"

PRODUCTOS DISPONIBLES:
${productos.map(p => `- ${p.nombre}: $${p.precio} (${p.descripcion}) - Establecimiento: ${p.nombre_establecimiento}`).join('\n')}

PREFERENCIAS DEL USUARIO: ${JSON.stringify(userPreferences)}

Devuelve un JSON con esta estructura EXACTA:
{
  "productos_recomendados": [
    {
      "id_producto": "número",
      "nombre": "nombre del producto",
      "precio": "precio",
      "razon_recomendacion": "por qué se recomienda este producto",
      "relevancia": "puntuación del 1-10"
    }
  ],
  "mensaje_personalizado": "mensaje amigable explicando la selección"
}

Ordena por relevancia (mayor a menor) y máximo 5 productos.
`;

    const result = await geminiModel.generateContent(searchPrompt);
    const response = await result.response;
    
    try {
      return JSON.parse(response.text());
    } catch {
      // Si falla el parsing, devolver estructura básica
      return {
        productos_recomendados: productos.slice(0, 5).map(p => ({
          id_producto: p.id_producto,
          nombre: p.nombre,
          precio: p.precio,
          razon_recomendacion: "Producto relacionado con tu búsqueda",
          relevancia: 7
        })),
        mensaje_personalizado: "Aquí tienes algunos productos que podrían interesarte."
      };
    }
  } catch (error) {
    console.error('Error en búsqueda de productos con IA:', error);
    throw error;
  }
};

export default geminiModel;