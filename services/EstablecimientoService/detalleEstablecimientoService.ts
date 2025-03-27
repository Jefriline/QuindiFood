import DetalleEstablecimientoRepository from '../../repositories/EstablecimientoRepository/detalleEstablecimientoRepository';
import { DetalleEstablecimientoDto } from '../../Dto/EstablecimientoDto/detalleEstablecimientoDto';

class DetalleEstablecimientoService {
    static async getById(id: number): Promise<DetalleEstablecimientoDto | null> {
        try {
            return await DetalleEstablecimientoRepository.getById(id);
        } catch (error) {
            console.error('Error en el servicio al obtener detalle del establecimiento:', error);
            throw error;
        }
    }
}

export default DetalleEstablecimientoService; 