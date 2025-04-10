import { Pool } from 'pg';
import { ImageDto } from '../../Dto/ImageDto/imageDto';

export class ImageRepository {
    private pool: Pool;

    constructor(pool: Pool) {
        this.pool = pool;
    }

    async uploadImage(image: ImageDto): Promise<number> {
        const query = `
            INSERT INTO multimedia_establecimiento (fk_id_establecimiento, multimedia)
            VALUES ($1, $2)
            RETURNING id_archivo
        `;
        const result = await this.pool.query(query, [image.fk_id_establecimiento, image.multimedia]);
        return result.rows[0].id_archivo;
    }

    async getImagesByEstablishment(establishmentId: number): Promise<ImageDto[]> {
        const query = `
            SELECT id_archivo, fk_id_establecimiento, multimedia
            FROM multimedia_establecimiento
            WHERE fk_id_establecimiento = $1
        `;
        const result = await this.pool.query(query, [establishmentId]);
        return result.rows;
    }

    async deleteImage(imageId: number): Promise<boolean> {
        const query = `
            DELETE FROM multimedia_establecimiento
            WHERE id_archivo = $1
            RETURNING id_archivo
        `;
        const result = await this.pool.query(query, [imageId]);
        return result.rowCount ? result.rowCount > 0 : false;
    }
} 