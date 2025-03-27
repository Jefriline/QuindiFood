import express from "express";
import registerUser from '../../controllers/UserController/registerUser';
import loginUser from '../../controllers/UserController/loginUser';
import userProfile from '../../controllers/UserController/profileUser';
import registerValidator from "../../middleware/UserValidator/registerValidator";
import userProfileMiddleware from "../../middleware/UserValidator/userProfileMiddleware";
import loginValidator from "../../middleware/UserValidator/loginValidator";
import registerAdmin from '../../controllers/UserController/registerAdmin';
import adminRegisterValidator from "../../middleware/UserValidator/adminRegisterMiddleware";

const router = express.Router();

// Ruta para registro de usuario
router.post('/register', 
    registerValidator.validatorRegister,
    registerValidator.validator,
    registerUser
);

// Ruta para login
router.post('/login',
    loginValidator.validatorLogin,
    loginValidator.validator,
    loginUser
);

router.get('/profile/:id',
    userProfileMiddleware.validatorProfile,
    userProfileMiddleware.validator,
    userProfile
);

// Ruta oculta para registro de administrador
router.post('/x7k9q2p5m3n8r4t6', 
    adminRegisterValidator.validatorAdminRegister,
    adminRegisterValidator.validator,
    registerAdmin
);

export default router; 