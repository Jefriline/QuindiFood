import express from "express";
import registerUser from "../../controllers/UserController/registerUser";

///

const router = express.Router();

router.post('/register', registerUser/* */)
router.post('/login', /* */)

export default router;