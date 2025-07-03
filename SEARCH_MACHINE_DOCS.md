# 🤖 Máquina de Búsqueda Ultra-Inteligente QuindiFood

## Sistema X-Ray de Análisis Total de BD

### 🎯 **Características Principales**
- **Análisis completo de BD**: Carga TODA la información en caché de memoria
- **Búsqueda semántica avanzada**: Natural Language Processing + TF-IDF + Fuzzy Search
- **Sin persistencia**: Historial solo en memoria durante la sesión
- **Súper velocidad**: Cache en RAM, análisis en paralelo
- **Análisis como X-ray**: Ve patrones, descripciones, comentarios, calificaciones

### ⚡ **Formato de Petición Simplificado**

```
POST /ai/chat
```

**Body:**
```json
{
  "prompt": "lo que sea que quiera buscar",
  "history": [
    {"user": "mensaje anterior", "ia": "respuesta anterior"},
    {"user": "otro mensaje", "ia": "otra respuesta"}
  ]
}
```

### 🔥 **Respuesta Ultra-Completa**

```json
{
  "success": true,
  "data": {
    "respuesta": "Texto conversacional generado por IA con análisis completo",
    "productos": [
      {
        "id_producto": 15,
        "nombre": "Churrasco Premium",
        "precio": 25000,
        "descripcion": "Corte de carne premium a la parrilla",
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
      "patron_busqueda": "busqueda_producto",
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

### 🧠 **Inteligencia Artificial Avanzada**

#### 1. **Análisis Semántico Profundo**
- **Tokenización**: Divide el texto en unidades significativas
- **Stemming**: Analiza raíces de palabras en español
- **TF-IDF**: Extrae palabras clave más relevantes
- **Análisis de sentimiento**: Detecta emociones y intenciones
- **Detección de entidades**: Encuentra comidas, ubicaciones, precios

#### 2. **5 Algoritmos de Búsqueda Paralelos**
1. **Búsqueda Exacta**: Palabras clave directas (peso 1.0)
2. **Búsqueda Fuzzy**: Errores de escritura, sinónimos (peso 0.8)
3. **Búsqueda Semántica**: Stems y variaciones (peso 0.7)
4. **Búsqueda por Patrones**: Intenciones detectadas (peso 0.9)
5. **Filtros Inteligentes**: Calidad, precio, ubicación automáticos

#### 3. **Detección Automática de Intenciones**
```javascript
"quiero carne con buena reputación" →
{
  busqueda_producto: 0.8,    // "quiero"
  tipo_comida: 1.0,          // "carne"
  filtro_calidad: 0.9,       // "buena reputación"
  filtro_precio: 0,
  filtro_ubicacion: 0
}
```

### 🔍 **Ejemplos de Búsquedas Inteligentes**

#### Ejemplo 1: Búsqueda con Calidad
```json
{
  "prompt": "quiero carne con buena reputación",
  "history": []
}
```
**Resultado**: Filtra automáticamente productos de carne con calificación ≥ 3.5

#### Ejemplo 2: Búsqueda con Precio
```json
{
  "prompt": "algo barato para almorzar",
  "history": []
}
```
**Resultado**: Ordena por precio ascendente, prioriza opciones económicas

#### Ejemplo 3: Búsqueda con Ubicación
```json
{
  "prompt": "pizza cerca del centro",
  "history": []
}
```
**Resultado**: Busca pizzas + filtro ubicación "centro"

#### Ejemplo 4: Búsqueda con Contexto
```json
{
  "prompt": "algo similar pero más barato",
  "history": [
    {"user": "quiero carne", "ia": "Te recomiendo el churrasco..."}
  ]
}
```
**Resultado**: Usa historial para entender "similar" = carne, busca opciones más económicas

### 💾 **Sistema de Caché Ultra-Rápido**

#### Datos Cargados en Memoria:
- **Productos completos**: nombre, descripción, precio, establecimiento, categorías
- **Establecimientos completos**: nombre, descripción, ubicación, productos, calificaciones
- **Comentarios de usuarios**: Texto completo para análisis semántico
- **Calificaciones**: Promedios y totales para filtrado por calidad
- **Texto de búsqueda completo**: Concatenación optimizada para análisis

#### Actualización Automática:
- **Caché expira cada 5 minutos**
- **Recarga automática en background**
- **No afecta velocidad de respuesta**

### 📊 **Análisis X-Ray Completo**

La máquina analiza:

#### En Productos:
- ✅ Nombre del producto
- ✅ Descripción completa
- ✅ Precio y rangos
- ✅ Categoría del producto
- ✅ Establecimiento que lo ofrece
- ✅ Ubicación del establecimiento
- ✅ Calificaciones y reviews
- ✅ Comentarios de usuarios
- ✅ Imágenes disponibles

#### En Establecimientos:
- ✅ Nombre del establecimiento
- ✅ Descripción del negocio
- ✅ Categoría (parrilla, cafetería, etc.)
- ✅ Ubicación exacta
- ✅ Teléfono y contacto
- ✅ Todos los productos que ofrece
- ✅ Calificaciones promedio
- ✅ Total de reviews
- ✅ Comentarios de clientes

### 🚀 **Implementación Frontend**

#### React Component Ultra-Simple
```jsx
import { useState } from 'react';

const SearchMachine = () => {
  const [prompt, setPrompt] = useState('');
  const [history, setHistory] = useState([]);
  const [resultado, setResultado] = useState(null);
  const [loading, setLoading] = useState(false);

  const buscar = async () => {
    if (!prompt.trim()) return;
    
    setLoading(true);
    try {
      const response = await fetch('/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ prompt, history })
      });
      
      const data = await response.json();
      if (data.success) {
        // Actualizar historial
        const nuevoHistorial = [
          ...history, 
          { user: prompt, ia: data.data.respuesta }
        ].slice(-6); // Mantener solo últimos 6 mensajes
        
        setHistory(nuevoHistorial);
        setResultado(data.data);
        setPrompt('');
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="search-machine">
      <div className="input-container">
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="¿Qué buscas? (ej: carne con buena reputación)"
          onKeyPress={(e) => e.key === 'Enter' && buscar()}
        />
        <button onClick={buscar} disabled={loading}>
          {loading ? '🔍 Analizando...' : '🚀 Buscar'}
        </button>
      </div>

      {resultado && (
        <div className="resultados">
          {/* Respuesta IA */}
          <div className="respuesta-ia">
            <h3>🤖 Análisis Inteligente</h3>
            <p>{resultado.respuesta}</p>
          </div>

          {/* Estadísticas */}
          <div className="stats">
            <span>⚡ {resultado.estadisticas.tiempo_busqueda_ms}ms</span>
            <span>📊 {resultado.estadisticas.productos_analizados} productos</span>
            <span>🎯 {(resultado.estadisticas.precision_busqueda * 100).toFixed(1)}% precisión</span>
          </div>

          {/* Análisis Semántico */}
          <div className="analisis">
            <h4>🧠 Análisis Detectado</h4>
            <p>Intención: {resultado.analisis_semantico.intencion_detectada}</p>
            <p>Confianza: {(resultado.analisis_semantico.nivel_confianza * 100).toFixed(1)}%</p>
            <p>Palabras clave: {resultado.analisis_semantico.palabras_clave.join(', ')}</p>
          </div>

          {/* Productos */}
          {resultado.productos.length > 0 && (
            <div className="productos">
              <h4>🍽️ Productos Encontrados</h4>
              {resultado.productos.map(producto => (
                <div key={producto.id_producto} className="producto-card">
                  <h5>{producto.nombre}</h5>
                  <p>${producto.precio}</p>
                  <small>{producto.nombre_establecimiento}</small>
                  <span>⭐ {producto.calificacion_promedio || 'N/A'}</span>
                  <span>🎯 Score: {(producto.search_score * 100).toFixed(0)}%</span>
                </div>
              ))}
            </div>
          )}

          {/* Establecimientos */}
          {resultado.establecimientos.length > 0 && (
            <div className="establecimientos">
              <h4>🏪 Establecimientos Encontrados</h4>
              {resultado.establecimientos.map(est => (
                <div key={est.id_establecimiento} className="establecimiento-card">
                  <h5>{est.nombre_establecimiento}</h5>
                  <p>{est.categoria} - {est.ubicacion}</p>
                  <span>⭐ {est.calificacion_promedio || 'N/A'}</span>
                  <span>📦 {est.total_productos} productos</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchMachine;
```

### 🛡️ **Seguridad y Límites**

- ✅ **Autenticación obligatoria**: Token JWT requerido
- ✅ **Rate limiting**: 10 requests por minuto
- ✅ **Solo establecimientos aprobados**: Filtro automático por estado
- ✅ **Sanitización de prompts**: Previene inyecciones
- ✅ **Validación de entrada**: Prompts de 2-500 caracteres

### ⚙️ **Configuración Requerida**

#### 1. Variables de Entorno
```env
GEMINI_API_KEY=tu_clave_api_gemini
```

#### 2. Dependencias Instaladas
```bash
npm install @xenova/transformers natural fuzzy-search
```

#### 3. No necesitas crear tablas adicionales
El sistema funciona completamente en memoria.

### 🔧 **Optimizaciones Implementadas**

1. **Caché en RAM**: Toda la BD cargada en memoria
2. **Búsqueda paralela**: 5 algoritmos ejecutándose simultáneamente
3. **Fuzzy search optimizado**: Maneja errores de escritura
4. **TF-IDF avanzado**: Extracción inteligente de palabras clave
5. **Stemming en español**: Análisis de raíces de palabras
6. **Scoring combinado**: Pesos inteligentes para relevancia
7. **Filtrado automático**: Sin configuración manual

¡Es una **máquina de búsqueda ultra-inteligente** que analiza TODO como un X-ray! 🚀🔍 