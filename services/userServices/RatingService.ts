import RatingRepository from '../../repositories/UserRepository/ratingRepository';
import RatingDto from '../../Dto/UserDto/ratingDto';

class RatingService {
    static async addRating(rating: RatingDto) {
        try {
            const puntuacion = await RatingRepository.addRating(rating);
            return {
                success: true,
                message: 'Puntuación agregada exitosamente',
                data: { puntuacion }
            };
        } catch (error) {
            if (error instanceof Error) {
                return {
                    success: false,
                    message: error.message
                };
            }
            throw error;
        }
    }

    static async updateRating(rating: RatingDto) {
        try {
            const puntuacion = await RatingRepository.updateRating(rating);
            return {
                success: true,
                message: 'Puntuación actualizada exitosamente',
                data: { puntuacion }
            };
        } catch (error) {
            if (error instanceof Error) {
                return {
                    success: false,
                    message: error.message
                };
            }
            throw error;
        }
    }

    static async getRating(id_cliente: number, id_establecimiento: number) {
        try {
            const puntuacion = await RatingRepository.getRating(id_cliente, id_establecimiento);
            
            if (puntuacion === null) {
                return {
                    success: false,
                    message: 'No se encontró una puntuación para este establecimiento'
                };
            }

            return {
                success: true,
                data: { puntuacion }
            };
        } catch (error) {
            console.error('Error en RatingService.getRating:', error);
            throw error;
        }
    }

    static async deleteRating(id_cliente: number, id_establecimiento: number) {
        try {
            const deleted = await RatingRepository.deleteRating(id_cliente, id_establecimiento);
            
            if (!deleted) {
                return {
                    success: false,
                    message: 'No se encontró una puntuación para eliminar'
                };
            }

            return {
                success: true,
                message: 'Puntuación eliminada exitosamente'
            };
        } catch (error) {
            console.error('Error en RatingService.deleteRating:', error);
            throw error;
        }
    }

    static async getAverageRating(id_establecimiento: number) {
        try {
            if (!id_establecimiento) {
                throw new Error('El ID del establecimiento es requerido');
            }

            const result = await RatingRepository.getAverageRating(id_establecimiento);
            
            if (!result || result.promedio === null) {
                return {
                    success: true,
                    message: 'No hay puntuaciones para este establecimiento',
                    data: {
                        establecimientoId: id_establecimiento,
                        promedio: 0
                    }
                };
            }

            return {
                success: true,
                message: 'Promedio obtenido exitosamente',
                data: result
            };
        } catch (error) {
            console.error('Error en RatingService.getAverageRating:', error);
            return {
                success: false,
                message: error instanceof Error ? error.message : 'Error al obtener el promedio'
            };
        }
    }
}

export default RatingService; 