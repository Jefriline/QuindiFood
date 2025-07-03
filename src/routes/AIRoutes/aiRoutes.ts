import { Router } from 'express';
import { aiChatController } from '../../controllers/AIController/aiChatController';
import { verifyAIAccess } from '../../middleware/AIValidator/aiAuthMiddleware';

const router = Router();

// Middleware común para todas las rutas de IA
router.use(verifyAIAccess); // Verificar autenticación

// MÁQUINA DE BÚSQUEDA ULTRA-INTELIGENTE
// Analiza TODA la BD como X-ray sin persistencia
router.post(
  '/chat',
  (req, res) => aiChatController.searchMachine(req, res)
);

export default router; 