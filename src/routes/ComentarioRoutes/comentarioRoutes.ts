import express from 'express';
import addComentario from '../../controllers/ComentarioController/addComentarioController';
import verifyToken from '../../middleware/UserValidator/verifyToken';
import addComentarioValidator from '../../middleware/ComentarioValidator/addComentarioValidator';
import deleteComentario from '../../controllers/ComentarioController/deleteComentarioController';
import deleteComentarioAdmin from '../../controllers/ComentarioController/deleteComentarioAdminController';
import verifyRole from '../../middleware/UserValidator/verifyRole';
import getComentariosEstablecimiento from '../../controllers/ComentarioController/getComentariosEstablecimientoController';
import getMisComentarios from '../../controllers/ComentarioController/getMisComentariosController';

const router = express.Router();

// Solo clientes autenticados pueden añadir comentarios
router.post('/', verifyToken, addComentarioValidator, addComentario);

// Eliminar mi propio comentario (cliente autenticado)
router.delete('/:id_comentario', verifyToken, deleteComentario);

// Eliminar cualquier comentario (solo admin)
router.delete('/admin/:id_comentario', verifyToken, verifyRole(['ADMIN']), deleteComentarioAdmin);

// Obtener comentarios de un establecimiento (público, árbol)
router.get('/establecimiento/:id_establecimiento', getComentariosEstablecimiento);

// Obtener mis comentarios (token, lista plana)
router.get('/mis-comentarios', verifyToken, getMisComentarios);

export default router; 