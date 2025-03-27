import { Router } from "express";
import registerAdmin from "../../controllers/UserController/registerAdmin";
import adminRegisterMiddleware from "../../middleware/UserValidator/adminRegisterMiddleware";

const router = Router();

// Ruta oculta para registro de administrador
router.post('/x7k9q2p5m3n8r4t6',
    adminRegisterMiddleware.validatorAdminRegister,
    adminRegisterMiddleware.validator,
    registerAdmin
);

export default router; 