import express from "express";
import registerEstablecimiento from "../../controllers/EstablecimientoController/registerEstablecimiento";
import establecimientoValidator from "../../middleware/EstablecimientoValidator/establecimientoValidator";

const router = express.Router();

router.post('/register', 
    establecimientoValidator.establecimientoValidatorParams, 
    establecimientoValidator.validator, 
    registerEstablecimiento
);

export default router; 