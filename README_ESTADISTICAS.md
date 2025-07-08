# 📊 Sistema de Estadísticas de Establecimientos - QuindiFood

## Descripción

Sistema completo de estadísticas para propietarios de establecimientos que incluye:
- **Seguimiento de actividad** en tiempo real
- **Gráficas interactivas** de barras y circulares  
- **Análisis de sentimientos** de comentarios
- **Exportación de datos** en formato JSON
- **Workers optimizados** para procesamiento en segundo plano
- **Limpieza automática** de registros antiguos (3 meses)

## 🗄️ Estructura de Base de Datos

### Tabla Principal: `actividad_establecimiento`

```sql
CREATE TABLE actividad_establecimiento (
    id_actividad SERIAL PRIMARY KEY,
    fk_id_establecimiento INT NOT NULL REFERENCES establecimiento(id_establecimiento) ON DELETE CASCADE,
    fk_id_usuario INT REFERENCES usuario_general(id_usuario) ON DELETE SET NULL,
    tipo_actividad VARCHAR(50) NOT NULL 
        CHECK (tipo_actividad IN ('clic_perfil', 'comentario', 'puntuacion', 'favorito', 'busqueda')),
    fecha_actividad TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    datos_adicionales JSONB
);
```

**Para crear la tabla, ejecuta**: `CREATE_ACTIVITY_TABLE.sql`

## 🔧 Configuración

### 1. Variables de Entorno

```env
NODE_ENV=development
ENABLE_TEST_MODE=true
```

### 2. Redis (Ya configurado)
```typescript
// Credenciales incluidas en src/config/redis-config.ts
host: 'redis-11101.c53.west-us.azure.redns.redis-cloud.com'
port: 11101
```

### 3. Workers Automáticos
Los workers se inician automáticamente al arrancar el servidor:
- **ActivityWorker**: Procesa registros de actividad en segundo plano
- **CleanupWorker**: Limpia registros antiguos diariamente a las 2:00 AM

## 🚀 Funcionalidades

### 📊 Dashboard de Estadísticas
**Endpoint**: `GET /estadisticas/dashboard`

**Parámetros opcionales**:
- `tipo_periodo`: `dia`, `semana`, `mes`, `trimestre`, `año`
- `fecha_inicio`: `YYYY-MM-DD`
- `fecha_fin`: `YYYY-MM-DD`

**Respuesta**:
```json
{
  "success": true,
  "data": {
    "estadisticas_generales": {
      "puntuaciones": {
        "total": 25,
        "promedio": 4.2,
        "distribucion": {...}
      },
      "actividad": {
        "clics_perfil": 150,
        "comentarios_totales": 25,
        "favoritos_totales": 80,
        "busquedas": 45
      },
      "comentarios": {
        "total": 25,
        "sentimiento": {...},
        "porcentajes": {...}
      }
    },
    "grafica_actividad": {...},
    "grafico_interacciones": {...},
    "tendencias": {...}
  }
}
```

### ⚡ Estadísticas Rápidas
**Endpoint**: `GET /estadisticas/rapidas`

Para widgets y resúmenes. Retorna los KPIs más importantes.

### 📤 Exportar Estadísticas
**Endpoint**: `GET /estadisticas/exportar`

Descarga un archivo JSON con todas las estadísticas del período seleccionado.

### 📈 Actividad Reciente
**Endpoint**: `GET /estadisticas/actividad-reciente`

Obtiene los últimos 7 días de actividad para gráficas en tiempo real.

## 🧪 Testing en localhost:10101

### Rutas de Prueba Especiales

**⚠️ Solo funcionan cuando accedes desde `localhost:10101`**

#### 1. Dashboard de Prueba
```bash
GET http://localhost:10101/estadisticas/test/dashboard/[USER_ID]
```

#### 2. Estadísticas Rápidas de Prueba  
```bash
GET http://localhost:10101/estadisticas/test/rapidas/[USER_ID]
```

#### 3. Generar Datos de Prueba
```bash
POST http://localhost:10101/estadisticas/test/generar-datos/[ESTABLISHMENT_ID]
Content-Type: application/json

{
  "dias": 30,
  "actividades_por_dia": 10
}
```

#### 4. Estado de Redis
```bash
GET http://localhost:10101/estadisticas/test/redis-status
```

## 🔄 Registro Automático de Actividad

### Actividad Registrada Automáticamente

1. **Clics en Perfil**: Cuando se accede a `GET /establecimiento/:id`
2. **Comentarios**: Cuando se crea un comentario en `POST /comentario`
3. **Favoritos**: Cuando se añade/remueve de favoritos
4. **Puntuaciones**: Cuando se califica un establecimiento
5. **Búsquedas**: Cuando aparece en resultados de búsqueda

### Datos Adicionales Registrados
```json
{
  "ip": "192.168.1.1",
  "user_agent": "Mozilla/5.0...",
  "referer": "https://example.com",
  "timestamp": "2024-01-15T10:30:00Z",
  "endpoint": "/establecimiento/123"
}
```

## 🛠️ Workers en Segundo Plano

### ActivityWorker
- **Función**: Procesa registros de actividad sin bloquear las responses
- **Cola**: Redis con `BRPOP` para eficiencia máxima
- **Optimización**: Limpia trabajos de Redis inmediatamente después de procesarlos

### CleanupWorker  
- **Programación**: Diario a las 2:00 AM (Colombia)
- **Función**: Elimina registros > 3 meses automáticamente
- **Desarrollo**: Cada 10 minutos para testing

### Gestión de Workers
```typescript
import { WorkerManager } from './workers/workerManager';

// Estado de workers
const status = WorkerManager.getStatus();

// Health check
const health = await WorkerManager.healthCheck();

// Reiniciar si es necesario
await WorkerManager.restart();
```

## 📱 Integración Frontend

### Ejemplo de Conexión (localhost:10101)

```javascript
// Dashboard completo
const dashboard = await fetch('http://localhost:10101/estadisticas/test/dashboard/123');

// Estadísticas rápidas para widgets
const rapidas = await fetch('http://localhost:10101/estadisticas/test/rapidas/123');

// Generar datos de prueba
await fetch('http://localhost:10101/estadisticas/test/generar-datos/123', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ dias: 30, actividades_por_dia: 15 })
});
```

### Componente de Gráficas (Ejemplo)
```javascript
// Usar los datos de grafica_actividad para Chart.js
const chartData = dashboard.data.grafica_actividad;

new Chart(ctx, {
  type: 'bar',
  data: chartData,
  options: {
    responsive: true,
    scales: {
      y: { beginAtZero: true }
    }
  }
});
```

## 🔒 Seguridad

### Autenticación
- **Producción**: Requiere token JWT válido + rol PROPIETARIO
- **Testing**: Simula autenticación para localhost:10101

### Validaciones
- Rangos de fechas máximo 6 meses para exportación
- Verificación de propiedad del establecimiento  
- Rate limiting implícito mediante Redis
- Datos sensibles anonimizados en logs

## ⚠️ Optimizaciones para 30MB Redis

### Eficiencia Extrema
1. **Limpieza inmediata**: Jobs eliminados de Redis al completarse
2. **TTL automático**: Keys expiran si no se procesan
3. **Cola FIFO**: `BRPOP` evita acumulación de trabajos
4. **Datos mínimos**: Solo IDs y timestamps en Redis
5. **Compresión**: JSON mínimo para jobs

### Monitoreo de Memoria
```bash
# CLI Redis para verificar memoria
redis-cli -u redis://default:yDTApseultakz4Btb9YolRtCvjRifzIl@redis-11101.c53.west-us.azure.redns.redis-cloud.com:11101 INFO memory
```

## 🚨 Alertas y Notificaciones

### Mensajes del Sistema
```typescript
// ✅ Éxito
console.log('📊 Estadísticas calculadas exitosamente');

// ⚠️ Advertencia  
console.warn('⚠️ Redis cerca del límite de memoria');

// ❌ Error
console.error('❌ Error procesando estadísticas');
```

### Health Check Endpoint
```bash
GET /estadisticas/test/redis-status
```

## 📋 Lista de Verificación de Implementación

- [x] ✅ Tabla `actividad_establecimiento` creada
- [x] ✅ Workers Redis configurados y optimizados
- [x] ✅ Middleware de tracking automático
- [x] ✅ Controllers, Services, Repositories completos
- [x] ✅ Rutas de testing para localhost:10101
- [x] ✅ Validaciones y seguridad implementadas
- [x] ✅ Limpieza automática de registros antiguos
- [x] ✅ Sistema de gráficas preparado para frontend
- [ ] 🔄 Frontend con gráficas conectado a localhost:10101
- [ ] 🔄 Testing end-to-end completo

## 🎯 Próximos Pasos

1. **Crear frontend** con gráficas Chart.js conectado a localhost:10101
2. **Testing completo** con datos reales
3. **Optimizar consultas** si es necesario
4. **Añadir más tipos de actividad** según necesidades
5. **Implementar notificaciones** en tiempo real (opcional)

---

**🔗 Enlaces Rápidos:**
- Configuración Redis: `src/config/redis-config.ts`
- Workers: `src/workers/`
- Rutas de prueba: `src/routes/EstadisticasRoutes/estadisticasRoutes.ts`
- Documentación API: Revisar controladores en `src/controllers/EstadisticasController/` 