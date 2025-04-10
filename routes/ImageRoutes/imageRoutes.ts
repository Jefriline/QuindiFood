import { Router } from 'express';
import { ImageController } from '../../controllers/ImageController/imageController';
import multer from 'multer';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

export const createImageRoutes = (imageController: ImageController) => {
    router.post('/', upload.single('image'), imageController.uploadImage);
    router.get('/establecimiento/:establishmentId', imageController.getImagesByEstablishment);
    router.delete('/:id', imageController.deleteImage);

    return router;
}; 