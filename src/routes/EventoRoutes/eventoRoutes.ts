import express from 'express';
import crearEvento from '../../controllers/EventoController/crearEventoController';
import verifyToken from '../../middleware/UserValidator/verifyToken';
import verifyRole from '../../middleware/UserValidator/verifyRole';
import crearEventoValidator from '../../middleware/EventoValidator/crearEventoValidator';
import { upload } from '../../middleware/EventoValidator/crearEventoValidator';
import agregarParticipacion from '../../controllers/EventoController/agregarParticipacionController';
import agregarParticipacionValidator from '../../middleware/EventoValidator/agregarParticipacionValidator';
import { uploadParticipacion } from '../../middleware/EventoValidator/agregarParticipacionValidator';
import editarEventoValidator, { uploadEditarEvento } from '../../middleware/EventoValidator/editarEventoValidator';
import editarEventoController from '../../controllers/EventoController/editarEventoController';
import eliminarEventoController from '../../controllers/EventoController/eliminarEventoController';
import editarParticipacionValidator, { uploadEditarParticipacion } from '../../middleware/EventoValidator/editarParticipacionValidator';
import editarParticipacionController from '../../controllers/EventoController/editarParticipacionController';
import eliminarParticipacionController from '../../controllers/EventoController/eliminarParticipacionController';
import listarEventosPublicoController from '../../controllers/EventoController/listarEventosPublicoController';
import detalleEventoPublicoController from '../../controllers/EventoController/detalleEventoPublicoController';
import agregarPatrocinadorController from '../../controllers/EventoController/agregarPatrocinadorController';
import editarPatrocinadorController from '../../controllers/EventoController/editarPatrocinadorController';
import eliminarPatrocinadorController from '../../controllers/EventoController/eliminarPatrocinadorController';
import { crearPatrocinadorValidator, editarPatrocinadorValidator, uploadPatrocinador } from '../../middleware/EventoValidator/patrocinadorValidator';

const router = express.Router();

// Crear evento (solo admin)
router.post('/', verifyToken, verifyRole(['ADMIN']), upload, crearEventoValidator, crearEvento);

// Agregar participación de establecimiento a un evento (solo admin)
router.post('/:id/participacion', verifyToken, verifyRole(['ADMIN']), uploadParticipacion, agregarParticipacionValidator, agregarParticipacion);

router.put('/:id', verifyToken, verifyRole(['ADMIN']), uploadEditarEvento, editarEventoValidator, editarEventoController);

router.delete('/:id', verifyToken, verifyRole(['ADMIN']), eliminarEventoController);

router.put('/participacion/:id_participacion', verifyToken, verifyRole(['ADMIN']), uploadEditarParticipacion, editarParticipacionValidator, editarParticipacionController);

router.delete('/participacion/:id_participacion', verifyToken, verifyRole(['ADMIN']), eliminarParticipacionController);

router.get('/', listarEventosPublicoController);
router.get('/:id', detalleEventoPublicoController);

router.post('/:id/patrocinador', verifyToken, verifyRole(['ADMIN']), uploadPatrocinador, crearPatrocinadorValidator, agregarPatrocinadorController);
router.put('/patrocinador_evento/:id_patrocinador_evento', verifyToken, verifyRole(['ADMIN']), uploadPatrocinador, editarPatrocinadorValidator, editarPatrocinadorController);
router.delete('/patrocinador_evento/:id_patrocinador_evento', verifyToken, verifyRole(['ADMIN']), eliminarPatrocinadorController);

export default router; 