import express from "express";
import registerUser from '../../controllers/UserController/registerUser';
import loginUser from '../../controllers/UserController/loginUser';
import userProfile from '../../controllers/UserController/profileUser';
import registerValidator from "../../middleware/UserValidator/registerValidator";
import loginValidator from "../../middleware/UserValidator/loginValidator";
import registerAdmin from '../../controllers/UserController/registerAdmin';
import adminRegisterValidator from "../../middleware/UserValidator/adminRegisterMiddleware";
import logoutUser from '../../controllers/UserController/logoutUser';
import logoutValidator from "../../middleware/UserValidator/logoutValidator";
import updateUserValidator from "../../middleware/UserValidator/updateUserValidator";
import updateUser from "../../controllers/UserController/updateUser";
import authMiddleware from "../../middleware/UserValidator/authMiddleware";
import deleteAccount from "../../controllers/UserController/deleteAccount";

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

router.get('/profile',
    authMiddleware,
    userProfile
);

// Ruta oculta para registro de administrador
router.post('/x7k9q2p5m3n8r4t6', 
    adminRegisterValidator.validatorAdminRegister,
    adminRegisterValidator.validator,
    registerAdmin
);

// Ruta para logout
router.post('/logout',
    logoutValidator.validatorLogout,
    logoutUser
);

router.put('/update',
    authMiddleware,
    updateUserValidator.validatorUpdateUser,
    updateUserValidator.validator,
    updateUser
);

router.delete('/delete-account',
    authMiddleware,
    deleteAccount
);

export default router; 