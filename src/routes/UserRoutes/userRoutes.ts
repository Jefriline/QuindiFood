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
import deleteAccount from "../../controllers/UserController/deleteAccount";
import toggleUserStatus from '../../controllers/UserController/toggleUserStatus';
import verifyToken from '../../middleware/UserValidator/verifyToken';
import verifyRole from '../../middleware/UserValidator/verifyRole';
import toggleStatusValidator from '../../middleware/UserValidator/toggleStatusValidator';
import ratingValidator from '../../middleware/UserValidator/ratingValidator';
import addRating from '../../controllers/UserController/addRating';
import updateRating from '../../controllers/UserController/updateRating';
import getRating from '../../controllers/UserController/getRating';
import deleteRating from '../../controllers/UserController/deleteRating';
import { getAverageRating } from '../../controllers/UserController/getAverageRating';
import getUserById from '../../controllers/UserController/getUserById';
import getUserByIdValidator from '../../middleware/UserValidator/getUserByIdMiddleware';
import refreshTokenController from '../../controllers/UserController/refreshToken';
import verifyTokenRefresh from '../../middleware/UserValidator/verifyTokenRefresh';
import confirmAccount from '../../controllers/UserController/confirmAccount';
import requestPasswordReset from '../../controllers/UserController/requestPasswordResetController';
import verifyResetCode from '../../controllers/UserController/verifyResetCodeController';
import resetPassword from '../../controllers/UserController/resetPasswordController';
import { validatePassword } from '../../middleware/UserValidator/passwordValidationMiddleware';
import { uploadMiddleware } from "../../middleware/UserValidator/updateUserValidator";
import verifyRoleController from '../../controllers/UserController/verifyRoleController';
import { verifyRoleToken } from '../../middleware/verifyRoleMiddleware';
const router = express.Router();

// Rutas públicas
router.post('/register', 
    registerValidator.validatorRegister,
    registerValidator.validator,
    registerUser
);

router.post('/login',
    loginValidator.validatorLogin,
    loginValidator.validator,
    loginUser
);

router.get('/publicprofile/:id',
    getUserByIdValidator.validatorGetUserById,
    getUserByIdValidator.validator,
    getUserById
);

// Ruta oculta para registro de administrador
router.post('/x7k9q2p5m3n8r4t6', 
    adminRegisterValidator.validatorAdminRegister,
    adminRegisterValidator.validator,
    registerAdmin
);

// Rutas protegidas
router.get('/profile',
    verifyToken,
    userProfile
);

router.post('/logout',
    verifyToken,
    logoutValidator.validatorLogout,
    logoutUser
);

router.put('/update',
    verifyToken,
    uploadMiddleware,
    updateUserValidator.validatorUpdateUser,
    updateUserValidator.validator,
    updateUser
);

router.delete('/delete-account',
    verifyToken,
    deleteAccount
);

// Rutas de administrador
router.put('/toggle-status/:id', 
    verifyToken,
    verifyRole(['ADMIN']),
    toggleStatusValidator.validatorToggleStatus,
    toggleStatusValidator.validator,
    toggleUserStatus
);

// Rutas de puntuaciones
router.post('/rating/:id_establecimiento',
    verifyToken,
    ratingValidator.validatorRating,
    ratingValidator.validator,
    addRating
);

router.put('/rating/:id_establecimiento',
    verifyToken,
    ratingValidator.validatorRating,
    ratingValidator.validator,
    updateRating
);

router.get('/rating/:id_establecimiento',
    verifyToken,
    getRating
);

router.delete('/rating/:id_establecimiento',
    verifyToken,
    deleteRating
);

router.get('/average-rating/:id_establecimiento',
    //verifyToken,
    getAverageRating
);

router.post('/refresh-token', verifyTokenRefresh, refreshTokenController);
router.get('/confirmar-cuenta', confirmAccount);


// Rutas de restablecimiento de contraseña
router.post('/password-reset/solicitar-restablecimiento', requestPasswordReset);
router.post('/password-reset/verificar-codigo', verifyResetCode);
router.post('/password-reset/restablecer-password', validatePassword, resetPassword);

// Agregar la nueva ruta para verificar rol
router.post('/verify-role',
    verifyRoleToken,
    verifyRoleController
);

export default router; 
