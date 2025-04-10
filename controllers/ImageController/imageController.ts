import { Request, Response } from 'express';
import { ImageService } from '../../services/ImageService/imageService';
import { ImageDto } from '../../Dto/ImageDto/imageDto';

export class ImageController {
    private imageService: ImageService;

    constructor(imageService: ImageService) {
        this.imageService = imageService;
    }

    uploadImage = async (req: Request, res: Response) => {
        try {
            const { fk_id_establecimiento } = req.body;
            const file = req.file;

            if (!file) {
                return res.status(400).json({ message: 'No file uploaded' });
            }

            const imageDto: ImageDto = {
                fk_id_establecimiento,
                multimedia: file.buffer
            };

            const imageId = await this.imageService.uploadImage(imageDto);
            res.status(201).json({ message: 'Image uploaded successfully', imageId });
        } catch (error) {
            console.error('Error uploading image:', error);
            res.status(500).json({ message: 'Error uploading image' });
        }
    };

    getImagesByEstablishment = async (req: Request, res: Response) => {
        try {
            const establishmentId = parseInt(req.params.establishmentId);
            const images = await this.imageService.getImagesByEstablishment(establishmentId);
            res.json(images);
        } catch (error) {
            console.error('Error getting images:', error);
            res.status(500).json({ message: 'Error getting images' });
        }
    };

    deleteImage = async (req: Request, res: Response) => {
        try {
            const imageId = parseInt(req.params.id);
            const success = await this.imageService.deleteImage(imageId);
            
            if (success) {
                res.json({ message: 'Image deleted successfully' });
            } else {
                res.status(404).json({ message: 'Image not found' });
            }
        } catch (error) {
            console.error('Error deleting image:', error);
            res.status(500).json({ message: 'Error deleting image' });
        }
    };
} 