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
            const result = await RatingRepository.getRating(id_cliente, id_establecimiento);
            
            if (result === null) {
                return {
                    success: false,
                    message: 'No se encontró una puntuación para este establecimiento'
                };
            }

            return {
                success: true,
                data: {
                    puntuacion: result.puntuacion,
                    id_establecimiento: result.id_establecimiento
                }
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
                        nombreEstablecimiento: result.nombreEstablecimiento,
                        promedio: 0,
                        total_puntuaciones: 0
                    }
                };
            }

            return {
                success: true,
                message: 'Promedio obtenido exitosamente',
                data: {
                    establecimientoId: result.establecimientoId,
                    nombreEstablecimiento: result.nombreEstablecimiento,
                    promedio: result.promedio,
                    total_puntuaciones: result.total_puntuaciones
                }
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