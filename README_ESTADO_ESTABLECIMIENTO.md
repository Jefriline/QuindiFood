# Verificación de Estado de Establecimiento de Usuario

## Descripción
Esta funcionalidad permite verificar si un usuario autenticado tiene un establecimiento registrado y obtener información sobre su estado actual.

## Endpoint
```
GET /establecimiento/estado-establecimiento
```

## Autenticación
- Requiere token de autenticación válido
- El token debe incluirse en el header: `Authorization: Bearer <token>`

## Respuesta

### Usuario sin establecimiento:
```json
{
    "success": true,
    "message": "Estado de establecimiento obtenido exitosamente",
    "data": {
        "tieneEstablecimiento": false
    }
}
```

### Usuario con establecimiento:
```json
{
    "success": true,
    "message": "Estado de establecimiento obtenido exitosamente",
    "data": {
        "tieneEstablecimiento": true,
        "idEstablecimiento": 123,
        "nombreEstablecimiento": "Restaurante Ejemplo",
        "estadoEstablecimiento": "Pendiente",
        "estadoMembresia": "Inactivo",
        "fechaCreacion": "2024-01-15T10:30:00.000Z"
    }
}
```

## Estados Posibles

### Estado del Establecimiento:
- **Pendiente**: Establecimiento registrado pero pendiente de aprobación por administrador
- **Aprobado**: Establecimiento aprobado y activo
- **Rechazado**: Establecimiento rechazado por administrador
- **Suspendido**: Establecimiento suspendido temporalmente

### Estado de Membresía:
- **Activo**: Usuario con membresía premium activa
- **Inactivo**: Usuario sin membresía premium

## Casos de Uso
1. **Verificar si un usuario puede crear un establecimiento**: Si `tieneEstablecimiento` es `false`, puede proceder con el registro
2. **Mostrar estado de solicitud**: Si `estadoEstablecimiento` es `Pendiente`, mostrar mensaje de espera
3. **Verificar acceso a funcionalidades**: Si `estadoEstablecimiento` es `Aprobado`, permitir acceso completo
4. **Mostrar información de membresía**: Mostrar estado de membresía para funcionalidades premium

## Estructura de Archivos Creados

### DTO
- `src/Dto/EstablecimientoDto/estadoEstablecimientoUsuarioDto.ts`

### Repositorio
- `src/repositories/EstablecimientoRepository/estadoEstablecimientoUsuarioRepository.ts`

### Servicio
- `src/services/EstablecimientoService/estadoEstablecimientoUsuarioService.ts`

### Controlador
- `src/controllers/EstablecimientoController/getEstadoEstablecimientoUsuarioController.ts`

### Middleware
- `src/middleware/EstablecimientoValidator/estadoEstablecimientoUsuarioValidator.ts`

### Rutas
- Agregada en `src/routes/EstablecimientoRoutes/establecimientoRoutes.ts`

## Ejemplo de Uso

```javascript
// Frontend - Verificar estado de establecimiento
const verificarEstadoEstablecimiento = async () => {
    try {
        const response = await fetch('/api/establecimiento/estado-establecimiento', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        const data = await response.json();
        
        if (data.success) {
            if (data.data.tieneEstablecimiento) {
                console.log('Estado:', data.data.estadoEstablecimiento);
                console.log('Membresía:', data.data.estadoMembresia);
            } else {
                console.log('No tiene establecimiento registrado');
            }
        }
    } catch (error) {
        console.error('Error:', error);
    }
};
``` 