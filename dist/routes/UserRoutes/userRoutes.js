"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const registerUser_1 = __importDefault(require("../../controllers/UserController/registerUser"));
///
const router = express_1.default.Router();
router.post('/register', registerUser_1.default /* */);
router.post('/login');
exports.default = router;
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
