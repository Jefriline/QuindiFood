import express from "express";
import registerUser from '../../controllers/UserController/registerUser';
import loginUser from '../../controllers/UserController/loginUser';
import userProfile from '../../controllers/UserController/profileUser';
import registerValidator from "../../middleware/UserValidator/registerValidator";
import userProfileMiddleware from "../../middleware/UserValidator/userProfileMiddleware";
import loginValidator from "../../middleware/UserValidator/loginValidator";

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

export default router; 