import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { AISearchMachine } from '../../services/AIService/aiSearchMachine';
import { CustomRequest } from '../../interfaces/customRequest';

export class AIChatController {
  private aiSearchMachine: AISearchMachine;

  constructor() {
    this.aiSearchMachine = new AISearchMachine();
  }

  // Máquina de búsqueda ultra-inteligente
  async searchMachine(req: CustomRequest, res: Response): Promise<void> {
    try {
      // Validar errores del middleware
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          error: 'Datos de entrada inválidos',
          details: errors.array()
        });
        return;
      }

      const { prompt, history = [] } = req.body;
      const userId = req.user?.data?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          error: 'Usuario no autenticado'
        });
        return;
      }

      if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
        res.status(400).json({
          success: false,
          error: 'El prompt es requerido'
        });
        return;
      }

      // La máquina analiza TODA la BD como X-ray
      const resultado = await this.aiSearchMachine.searchMachine(
        prompt.trim(),
        history
      );

      res.status(200).json({
        success: true,
        data: resultado
      });

    } catch (error: any) {
      console.error('💥 Error en AI Chat Controller:', error);
      console.error('Stack trace:', error.stack);
      
      // Errores específicos más útiles
      let errorMessage = 'Error interno del servidor';
      let statusCode = 500;
      
      if (error.code === 'ECONNREFUSED') {
        errorMessage = 'Error: No se puede conectar a la base de datos';
        statusCode = 503;
      } else if (error.code === '42703') {
        errorMessage = `Error de base de datos: Columna no existe - ${error.message}`;
        statusCode = 500;
      } else if (error.code === '42P01') {
        errorMessage = `Error de base de datos: Tabla no existe - ${error.message}`;
        statusCode = 500;
      } else if (error.name === 'ValidationError') {
        errorMessage = `Error de validación: ${error.message}`;
        statusCode = 400;
      } else if (error.message && error.message.includes('Gemini')) {
        errorMessage = `Error de IA Gemini: ${error.message}`;
        statusCode = 502;
      } else if (error.message && error.message.includes('fetch')) {
        errorMessage = `Error de conexión externa: ${error.message}`;
        statusCode = 502;
      } else if (error.message) {
        errorMessage = `Error específico: ${error.message}`;
      }
      
      res.status(statusCode).json({
        success: false,
        error: errorMessage,
        details: {
          type: error.name || 'UnknownError',
          code: error.code || null,
          timestamp: new Date().toISOString(),
          endpoint: '/ai/chat'
        },
        // Solo en desarrollo - no en producción
        ...(process.env.NODE_ENV === 'development' && {
          stack_trace: error.stack
        })
      });
    }
  }
}

// Instancia única del controlador
export const aiChatController = new AIChatController(); 