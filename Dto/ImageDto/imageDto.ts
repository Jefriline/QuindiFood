export interface ImageDto {
    id_archivo?: number;
    fk_id_establecimiento: number;
    multimedia: Buffer;
}

export interface ImageResponseDto {
    id_archivo: number;
    fk_id_establecimiento: number;
    multimedia: string; // Base64 string
} 