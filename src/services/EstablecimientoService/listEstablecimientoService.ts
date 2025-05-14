import ListEstablecimientoRepository from '../../repositories/EstablecimientoRepository/listEstablecimientoRepository';
import { ListEstablecimientoDto } from '../../Dto/EstablecimientoDto/listEstablecimientoDto';

export class ListEstablecimientoService {
    static async getAll(): Promise<ListEstablecimientoDto[]> {
        try {
            console.log('Iniciando proceso de obtención de establecimientos');
            const establecimientos = await ListEstablecimientoRepository.getAll();
            console.log('Establecimientos obtenidos exitosamente');
            return establecimientos;
        } catch (error) {
            console.error('Error en el servicio al obtener establecimientos:', error);
            throw error;
        }
    }

    static async getEstablecimientoById(id: number): Promise<ListEstablecimientoDto> {
        try {
            console.log(`Iniciando proceso de obtención del establecimiento con ID: ${id}`);
            const establecimiento = await ListEstablecimientoRepository.getEstablecimientoById(id);
            console.log(`Establecimiento obtenido exitosamente`);
            return establecimiento;
        } catch (error) {
            console.error(`Error en el servicio al obtener el establecimiento con ID: ${id}`, error);
            throw error;
        }
    }

    static async getEstadoEstablecimiento(id: number): Promise<boolean> {
        try {
            console.log(`Iniciando proceso de obtención del estado del establecimiento con ID: ${id}`);
            const estado = await ListEstablecimientoRepository.getEstadoEstablecimiento(id);
            console.log(`Estado obtenido exitosamente`);
            return estado;
        } catch (error) {
            console.error(`Error en el servicio al obtener el estado del establecimiento con ID: ${id}`, error);
            throw error;
        }
    }
}

export default ListEstablecimientoService; 