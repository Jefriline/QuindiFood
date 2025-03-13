import express from "express";
import registerUser from "../../controllers/UserController/registerUser";

///

const router = express.Router();

router.post('/register', registerUser/* */)
router.post('/login', /* */)

export default router;

// //Aqui igual

// import express from 'express';
// import { UserController } from '../controllers/UserController';
// import { isAuthenticated } from '../middleware/AuthMiddleware';

// const router = express.Router();
// const userController = new UserController();

// router.post('/login', userController.login);
// router.post('/register', userController.register);
// router.post('/recover-password', userController.recoverPassword);
// router.get('/profile/:id', isAuthenticated, userController.showProfile);
// router.put('/profile/:id', isAuthenticated, userController.updateProfile);
// router.post('/logout', isAuthenticated, userController.logout);
// router.post('/contact-support', userController.contactSupport);
// router.put('/change-role/:id', isAuthenticated, userController.changeRole);

// export default router;