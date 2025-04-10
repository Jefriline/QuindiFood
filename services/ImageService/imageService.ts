import { ImageRepository } from '../../repositories/ImageRepository/imageRepository';
import { ImageDto, ImageResponseDto } from '../../Dto/ImageDto/imageDto';

export class ImageService {
    private imageRepository: ImageRepository;

    constructor(imageRepository: ImageRepository) {
        this.imageRepository = imageRepository;
    }

    async uploadImage(image: ImageDto): Promise<number> {
        return await this.imageRepository.uploadImage(image);
    }

    async getImagesByEstablishment(establishmentId: number): Promise<ImageResponseDto[]> {
        const images = await this.imageRepository.getImagesByEstablishment(establishmentId);
        return images.map(image => ({
            ...image,
            multimedia: image.multimedia.toString('base64')
        }));
    }

    async deleteImage(imageId: number): Promise<boolean> {
        return await this.imageRepository.deleteImage(imageId);
    }
} 