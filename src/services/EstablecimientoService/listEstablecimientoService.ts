import ListEstablecimientoRepository from '../../repositories/EstablecimientoRepository/listEstablecimientoRepository';
import { ListEstablecimientoDto } from '../../Dto/EstablecimientoDto/listEstablecimientoDto';

export class ListEstablecimientoService {
    static async getAll(): Promise<ListEstablecimientoDto[]> {
        try {
            
            const establecimientos = await ListEstablecimientoRepository.getAll();
            
            // Transformar los resultados en DTOs
            const establecimientosDto = establecimientos.map(establecimiento => {
                return new ListEstablecimientoDto(
                    establecimiento.id_establecimiento,
                    establecimiento.nombre,
                    establecimiento.descripcion,
                    establecimiento.multimedia
                );
            });

            console.log('Establecimientos obtenidos exitosamente');
            return establecimientosDto;
        } catch (error) {
            console.error('Error en el servicio al obtener establecimientos:', error);
            throw error;
        }
    }
}

export default ListEstablecimientoService; 