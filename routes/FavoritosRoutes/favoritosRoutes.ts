import express from 'express';
import addFavorito from '../../controllers/FavoritosController/addFavorito';
import { verifyToken } from '../../middleware/verifyToken/verifyToken';

const router = express.Router();

// Ruta para agregar un establecimiento a favoritos
router.post('/:id_establecimiento', verifyToken, addFavorito);

export default router; 