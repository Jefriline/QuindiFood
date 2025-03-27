import { EstablecimientoDto } from '../../Dto/EstablecimientoDto/establecimientoDto';
import { MultimediaEstablecimientoDto } from '../../Dto/EstablecimientoDto/multimediaEstablecimientoDto';
import { ContactoEstablecimientoDto } from '../../Dto/EstablecimientoDto/contactoEstablecimientoDto';
import { DocumentacionDto } from '../../Dto/EstablecimientoDto/documentacionDto';
import { EstadoMembresiaDto } from '../../Dto/EstablecimientoDto/estadoMembresiaDto';
import EstablecimientoRepository from '../../repositories/EstablecimientoRepository/establecimientoRepository';
import ListEstablecimientoRepository from '../../repositories/EstablecimientoRepository/listEstablecimientoRepository';
import { ListEstablecimientoDto } from '../../Dto/EstablecimientoDto/listEstablecimientoDto';

export class EstablecimientoService {
    static async add(
        establecimiento: EstablecimientoDto,
        multimedia: MultimediaEstablecimientoDto,
        contactos: ContactoEstablecimientoDto[],
        documentacion: DocumentacionDto,
        estadoMembresia: EstadoMembresiaDto
    ) {
        try {
            console.log('Iniciando proceso de registro de establecimiento');
            
            const result = await EstablecimientoRepository.add(
                establecimiento,
                multimedia,
                contactos,
                documentacion,
                estadoMembresia
            );

            console.log('Guardado en base de datos exitoso');
            console.log('Registro de establecimiento exitoso');
            
            return result;
        } catch (error) {
            console.error('Error en el servicio al registrar establecimiento:', error);
            throw error;
        }
    }

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
}

export default EstablecimientoService; 