import EstablecimientoCompletoRepository from '../../repositories/EstablecimientoRepository/establecimientoCompletoRepository';
import { EstablecimientoCompletoDto } from '../../Dto/EstablecimientoDto/establecimientoCompletoDto';

export class EstablecimientoCompletoService {
    static async getAll(): Promise<EstablecimientoCompletoDto[]> {
        try {
            console.log('Iniciando proceso de obtención de establecimientos completos');
            const establecimientos = await EstablecimientoCompletoRepository.getAll();
            console.log('Establecimientos completos obtenidos exitosamente');
            return establecimientos;
        } catch (error) {
            console.error('Error en el servicio al obtener establecimientos completos:', error);
            throw error;
        }
    }
} 