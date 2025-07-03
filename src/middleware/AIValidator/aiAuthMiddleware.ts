import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { CustomRequest } from '../../interfaces/customRequest';

const JWT_SECRET = process.env.KEY_TOKEN || 'your-secret-key';

// Verificar que el usuario esté autenticado para usar IA
export const verifyAIAccess = (req: CustomRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.substring(7) : null;
    
    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Token de autorización requerido',
        details: {
          message: 'Debes incluir el header: Authorization: Bearer <tu_token>',
          received_header: authHeader || 'ninguno',
          endpoint: req.path
        }
      });
    }

    jwt.verify(token, JWT_SECRET, (err: any, decoded: any) => {
      if (err) {
        let errorMessage = 'Token inválido';
        if (err.name === 'TokenExpiredError') {
          errorMessage = 'Token expirado. Debes hacer login nuevamente.';
        } else if (err.name === 'JsonWebTokenError') {
          errorMessage = 'Token malformado o inválido.';
        } else if (err.name === 'NotBeforeError') {
          errorMessage = 'Token aún no es válido.';
        }
        
        return res.status(401).json({
          success: false,
          error: errorMessage,
          details: {
            type: err.name,
            message: err.message,
            expired_at: err.expiredAt || null,
            endpoint: req.path
          }
        });
      }

      // Asignar usuario al request
      req.user = decoded;
      next();
    });

  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: 'Error interno en autenticación',
      details: {
        message: error.message,
        type: error.name || 'UnknownError'
      }
    });
  }
};

// Validar que solo clientes puedan hacer búsquedas básicas
export const onlyClienteAI = (req: CustomRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Usuario no autenticado'
      });
    }

    // Verificar que sea cliente
    if (req.user.role !== 'cliente') {
      return res.status(403).json({
        success: false,
        error: 'Solo los clientes pueden realizar búsquedas con IA'
      });
    }

    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
};

// Validar entrada de búsqueda de productos
export const validateAISearchInput = (req: Request, res: Response, next: NextFunction) => {
  try {
    const { query, filters } = req.body;

    // Validar que la consulta exista y no esté vacía
    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'La consulta de búsqueda es requerida'
      });
    }

    // Validar longitud de la consulta
    if (query.trim().length < 3) {
      return res.status(400).json({
        success: false,
        error: 'La consulta debe tener al menos 3 caracteres'
      });
    }

    if (query.trim().length > 200) {
      return res.status(400).json({
        success: false,
        error: 'La consulta no puede exceder 200 caracteres'
      });
    }

    // Validar caracteres especiales maliciosos
    const maliciousPatterns = [
      /<script/i,
      /javascript:/i,
      /on\w+\s*=/i,
      /eval\s*\(/i,
      /expression\s*\(/i
    ];

    if (maliciousPatterns.some(pattern => pattern.test(query))) {
      return res.status(400).json({
        success: false,
        error: 'La consulta contiene caracteres no permitidos'
      });
    }

    // Validar filtros si existen
    if (filters && typeof filters === 'object') {
      const allowedFilters = ['categoria', 'precio_min', 'precio_max', 'ubicacion'];
      const filterKeys = Object.keys(filters);
      
      const invalidFilters = filterKeys.filter(key => !allowedFilters.includes(key));
      if (invalidFilters.length > 0) {
        return res.status(400).json({
          success: false,
          error: `Filtros no válidos: ${invalidFilters.join(', ')}`
        });
      }

      // Validar tipos de filtros
      if (filters.precio_min && (isNaN(filters.precio_min) || filters.precio_min < 0)) {
        return res.status(400).json({
          success: false,
          error: 'El precio mínimo debe ser un número válido mayor o igual a 0'
        });
      }

      if (filters.precio_max && (isNaN(filters.precio_max) || filters.precio_max < 0)) {
        return res.status(400).json({
          success: false,
          error: 'El precio máximo debe ser un número válido mayor o igual a 0'
        });
      }

      if (filters.precio_min && filters.precio_max && filters.precio_min > filters.precio_max) {
        return res.status(400).json({
          success: false,
          error: 'El precio mínimo no puede ser mayor al precio máximo'
        });
      }
    }

    // Sanitizar la consulta
    req.body.query = query.trim();
    
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
};

// Validar entrada para chat general
export const validateAIChatInput = (req: Request, res: Response, next: NextFunction) => {
  try {
    const { mensaje } = req.body;

    if (!mensaje || typeof mensaje !== 'string' || mensaje.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'El mensaje es requerido'
      });
    }

    if (mensaje.trim().length < 2) {
      return res.status(400).json({
        success: false,
        error: 'El mensaje debe tener al menos 2 caracteres'
      });
    }

    if (mensaje.trim().length > 500) {
      return res.status(400).json({
        success: false,
        error: 'El mensaje no puede exceder 500 caracteres'
      });
    }

    // Validar caracteres maliciosos
    const maliciousPatterns = [
      /<script/i,
      /javascript:/i,
      /on\w+\s*=/i,
      /eval\s*\(/i,
      /expression\s*\(/i,
      /sql\s+(select|insert|update|delete|drop|create|alter)/i
    ];

    if (maliciousPatterns.some(pattern => pattern.test(mensaje))) {
      return res.status(400).json({
        success: false,
        error: 'El mensaje contiene contenido no permitido'
      });
    }

    req.body.mensaje = mensaje.trim();
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
};

// Rate limiting básico para IA (máximo 10 requests por minuto por usuario)
const requestCounts = new Map<string, { count: number; resetTime: number }>();

export const aiRateLimit = (req: CustomRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Usuario no autenticado'
      });
    }

    const now = Date.now();
    const windowMs = 60 * 1000; // 1 minuto
    const maxRequests = 10;

    const userRequests = requestCounts.get(userId.toString());

    if (!userRequests || now > userRequests.resetTime) {
      // Primer request o ventana expirada
      requestCounts.set(userId.toString(), {
        count: 1,
        resetTime: now + windowMs
      });
      next();
    } else if (userRequests.count < maxRequests) {
      // Incrementar contador
      userRequests.count++;
      next();
    } else {
      // Límite excedido
      return res.status(429).json({
        success: false,
        error: 'Demasiadas solicitudes. Intenta de nuevo en un minuto.',
        retryAfter: Math.ceil((userRequests.resetTime - now) / 1000)
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
}; 