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
