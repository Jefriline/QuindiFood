import express from 'express';
import addFavorito from '../../controllers/FavoritoController/addFavoritoController';
import removeFavorito from '../../controllers/FavoritoController/removeFavoritoController';
import listFavoritos from '../../controllers/FavoritoController/listFavoritosController';
import getTotalFavoritos from '../../controllers/FavoritoController/getTotalFavoritosController';
import verifyToken from '../../middleware/UserValidator/verifyToken';

const router = express.Router();

// Rutas públicas
router.get('/list/:id_cliente', listFavoritos);
router.get('/total/:id_establecimiento', getTotalFavoritos);

// Rutas protegidas
router.post('/add/:id_establecimiento', verifyToken, addFavorito);
router.delete('/remove/:id_establecimiento', verifyToken, removeFavorito);

export default router; 