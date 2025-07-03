# 🚀 Ejemplos de Uso - Máquina de Búsqueda QuindiFood

## Cómo Probar la Máquina X-Ray

### 1. **Arrancar el Servidor**
```bash
npm start
```

### 2. **Endpoint de la Máquina**
```
POST http://localhost:10101/ai/chat
```

---

## 📝 **Ejemplo 1: Búsqueda con Calidad**

### **Petición:**
```bash
curl -X POST http://localhost:10101/ai/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TU_JWT_TOKEN" \
  -d '{
    "prompt": "quiero carne con buena reputación",
    "history": []
  }'
```

### **Lo que hace la máquina automáticamente:**
1. 🧠 **Análisis semántico**:
   - Detecta: `tipo_comida: "carne"` (peso 1.0)
   - Detecta: `filtro_calidad: "buena reputación"` (peso 0.9)
   - Confianza: ~92%

2. 🔍 **Búsqueda paralela**:
   - **Exacta**: Busca "carne" en nombres/descripciones
   - **Fuzzy**: Encuentra "carnes", "carnita", etc.
   - **Semántica**: Stems como "carn", "meat", etc.
   - **Filtros**: Solo productos con calificación ≥ 3.5

3. 🎯 **Resultado esperado**:
```json
{
  "success": true,
  "data": {
    "respuesta": "¡Perfecto! Encontré excelentes opciones de carne con muy buena reputación. Te recomiendo el Churrasco Premium del Asador (⭐4.8) por $25,000, es súper popular y tiene comentarios increíbles. También está la Parrillada Especial de La Brasería (⭐4.6) por $22,000...",
    "productos": [
      {
        "id_producto": 15,
        "nombre": "Churrasco Premium",
        "precio": 25000,
        "descripcion": "Corte premium a la parrilla con guarnición",
        "nombre_establecimiento": "El Asador",
        "ubicacion": "Centro Armenia",
        "categoria_producto": "Carnes",
        "calificacion_promedio": "4.8",
        "search_score": 0.95
      }
    ],
    "establecimientos": [
      {
        "id_establecimiento": 5,
        "nombre_establecimiento": "El Asador",
        "categoria": "Parrilla",
        "calificacion_promedio": "4.8",
        "total_productos": 12,
        "search_score": 0.87
      }
    ],
    "analisis_semantico": {
      "intencion_detectada": "filtro_calidad",
      "patron_busqueda": "tipo_comida",
      "palabras_clave": ["carne", "bueno", "reputacion"],
      "nivel_confianza": 0.92
    },
    "estadisticas": {
      "tiempo_busqueda_ms": 45,
      "productos_analizados": 1247,
      "establecimientos_analizados": 156,
      "precision_busqueda": 0.89
    }
  }
}
```

---

## 📝 **Ejemplo 2: Búsqueda con Precio**

### **Petición:**
```bash
curl -X POST http://localhost:10101/ai/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TU_JWT_TOKEN" \
  -d '{
    "prompt": "algo barato para almorzar",
    "history": []
  }'
```

### **Lo que detecta:**
- `busqueda_producto: "algo"` (peso 0.8)
- `filtro_precio: "barato"` (peso 0.7)
- `tipo_comida: "almorzar"` (peso 1.0)

### **Resultado esperado:**
- Productos ordenados por **precio ascendente**
- Prioriza opciones económicas (<$15,000)
- Respuesta: "¡Perfecto para el presupuesto! Te recomiendo la Hamburguesa Clásica por $8,000 en Burger Express..."

---

## 📝 **Ejemplo 3: Búsqueda con Ubicación**

### **Petición:**
```bash
curl -X POST http://localhost:10101/ai/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TU_JWT_TOKEN" \
  -d '{
    "prompt": "pizza cerca del centro",
    "history": []
  }'
```

### **Lo que detecta:**
- `tipo_comida: "pizza"` (peso 1.0)
- `filtro_ubicacion: "centro"` (peso 0.6)

### **Resultado esperado:**
- Solo pizzas de establecimientos en "centro"
- Respuesta: "Encontré las mejores pizzas del centro de Armenia..."

---

## 📝 **Ejemplo 4: Búsqueda con Historial (Contexto)**

### **Petición:**
```bash
curl -X POST http://localhost:10101/ai/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TU_JWT_TOKEN" \
  -d '{
    "prompt": "algo similar pero más barato",
    "history": [
      {
        "user": "quiero carne con buena reputación",
        "ia": "Te recomiendo el Churrasco Premium por $25,000..."
      }
    ]
  }'
```

### **Lo que hace:**
- Usa el **historial** para entender que "similar" = carne
- Detecta `filtro_precio: "más barato"`
- Busca carnes con precio < $25,000

### **Resultado esperado:**
- Respuesta: "Entiendo que buscas carne más económica. Te recomiendo la Parrillada Familiar por $18,000..."

---

## 📝 **Ejemplo 5: Chat General (Sin Búsqueda)**

### **Petición:**
```bash
curl -X POST http://localhost:10101/ai/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TU_JWT_TOKEN" \
  -d '{
    "prompt": "¿cómo funcionan las calificaciones?",
    "history": []
  }'
```

### **Lo que detecta:**
- **No** es búsqueda de comida
- Genera respuesta informativa sobre la app

### **Resultado esperado:**
- Respuesta: "Las calificaciones en QuindiFood van de 1 a 5 estrellas. Los usuarios pueden calificar establecimientos..."
- `productos: []`
- `establecimientos: []`

---

## 🧪 **Prueba con Postman**

### **1. Configurar Headers:**
```
Content-Type: application/json
Cookie: token=tu_jwt_token_aqui
```

### **2. URL:**
```
POST http://localhost:10101/ai/chat
```

### **3. Body (raw JSON):**
```json
{
  "prompt": "quiero carne con buena reputación",
  "history": []
}
```

---

## 🔍 **Qué Ver en la Respuesta**

### **🧠 Análisis Semántico:**
- `intencion_detectada`: Qué tipo de búsqueda detectó
- `nivel_confianza`: Qué tan segura está (0-1)
- `palabras_clave`: Palabras importantes extraídas

### **⚡ Estadísticas:**
- `tiempo_busqueda_ms`: Velocidad de respuesta
- `productos_analizados`: Cuántos productos tiene en caché
- `precision_busqueda`: Qué tan relevantes son los resultados

### **🎯 Scores de Relevancia:**
- Cada producto tiene un `search_score` (0-1)
- Mientras más alto, más relevante para la búsqueda

---

## 🐛 **Solución de Problemas**

### **Error 401 - No autenticado:**
```bash
# Necesitas un token válido en las cookies
# Primero haz login:
curl -X POST http://localhost:10101/user/login \
  -H "Content-Type: application/json" \
  -d '{"email": "usuario@example.com", "password": "password"}'
```

### **Error 429 - Rate limit:**
```
Demasiadas solicitudes. Espera 1 minuto.
```

### **Error 500 - BD no conectada:**
```
Verifica que PostgreSQL esté corriendo y las variables de entorno estén configuradas.
```

---

## 🚀 **Ejemplo Frontend React**

```jsx
const SearchMachine = () => {
  const [prompt, setPrompt] = useState('');
  const [resultado, setResultado] = useState(null);

  const buscar = async () => {
    const response = await fetch('/ai/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ prompt, history: [] })
    });
    
    const data = await response.json();
    setResultado(data.data);
  };

  return (
    <div>
      <input 
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Ej: quiero carne con buena reputación"
      />
      <button onClick={buscar}>🔍 Buscar</button>
      
      {resultado && (
        <div>
          <p>{resultado.respuesta}</p>
          <p>⚡ {resultado.estadisticas.tiempo_busqueda_ms}ms</p>
          <p>🎯 {(resultado.estadisticas.precision_busqueda * 100).toFixed(1)}% precisión</p>
        </div>
      )}
    </div>
  );
};
```

¡La máquina está lista para analizar TODA tu BD como un X-ray! 🔍🚀 