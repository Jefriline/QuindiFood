import { EstablecimientoDto } from '../../Dto/EstablecimientoDto/establecimientoDto';
import { MultimediaEstablecimientoDto } from '../../Dto/EstablecimientoDto/multimediaEstablecimientoDto';
import { ContactoEstablecimientoDto } from '../../Dto/EstablecimientoDto/contactoEstablecimientoDto';
import { DocumentacionDto } from '../../Dto/EstablecimientoDto/documentacionDto';
import { EstadoMembresiaDto } from '../../Dto/EstablecimientoDto/estadoMembresiaDto';
import { EstadoEstablecimientoUsuarioDto } from '../../Dto/EstablecimientoDto/estadoEstablecimientoUsuarioDto';
import EstablecimientoRepository from '../../repositories/EstablecimientoRepository/establecimientoRepository';
import ListEstablecimientoRepository from '../../repositories/EstablecimientoRepository/listEstablecimientoRepository';
import { ListEstablecimientoDto } from '../../Dto/EstablecimientoDto/listEstablecimientoDto';

export class EstablecimientoService {
    static async add(
        establecimiento: EstablecimientoDto,
        multimedia: MultimediaEstablecimientoDto | null,
        documentacion: DocumentacionDto | null,
        estadoMembresia: EstadoMembresiaDto,
        horarios?: any[]
    ) {
        try {
            console.log('Iniciando proceso de registro de establecimiento');
            
            const result = await EstablecimientoRepository.add(
                establecimiento,
                multimedia,
                documentacion,
                estadoMembresia,
                horarios
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

    static async aprobarEstablecimiento(id: number, motivo?: string) {
        try {
            console.log(`Iniciando proceso de aprobación del establecimiento con ID: ${id}`);
            const resultado = await EstablecimientoRepository.aprobarEstablecimiento(id, motivo);
            console.log('Establecimiento aprobado exitosamente');
            return resultado;
        } catch (error) {
            console.error('Error en el servicio al aprobar establecimiento:', error);
            throw error;
        }
    }

    static async rechazarEstablecimiento(id: number, motivo: string) {
        try {
            console.log(`Iniciando proceso de rechazo del establecimiento con ID: ${id}`);
            const resultado = await EstablecimientoRepository.rechazarEstablecimiento(id, motivo);
            console.log('Establecimiento rechazado exitosamente');
            return resultado;
        } catch (error) {
            console.error('Error en el servicio al rechazar establecimiento:', error);
            throw error;
        }
    }

    static async getSolicitudesPendientes() {
        try {
            console.log('Iniciando proceso de obtención de solicitudes pendientes');
            const solicitudes = await EstablecimientoRepository.getSolicitudesPendientes();
            console.log('Solicitudes pendientes obtenidas exitosamente');
            return solicitudes;
        } catch (error) {
            console.error('Error en el servicio al obtener solicitudes pendientes:', error);
            throw error;
        }
    }

    static async suspenderEstablecimiento(id: number) {
        try {
            console.log(`Iniciando proceso de suspensión del establecimiento con ID: ${id}`);
            const resultado = await EstablecimientoRepository.suspenderEstablecimiento(id);
            console.log('Establecimiento suspendido exitosamente');
            return resultado;
        } catch (error) {
            console.error('Error en el servicio al suspender establecimiento:', error);
            throw error;
        }
    }

    static async eliminarEstablecimientoCompleto(idEstablecimiento: number, idUsuario?: number, isAdmin = false) {
        return await EstablecimientoRepository.eliminarEstablecimientoCompleto(idEstablecimiento, idUsuario, isAdmin);
    }

    static async getMiEstablecimiento(idUsuario: number) {
        try {
            console.log(`Obteniendo establecimiento para usuario ID: ${idUsuario}`);
            const establecimiento = await EstablecimientoRepository.getMiEstablecimiento(idUsuario);
            console.log('Establecimiento obtenido exitosamente');
            return establecimiento;
        } catch (error) {
            console.error('Error en el servicio al obtener mi establecimiento:', error);
            throw error;
        }
    }

    static async editarEstablecimiento(
        idEstablecimiento: number, 
        datosActualizados: any, 
        nuevasFotos?: string[], 
        fotosAEliminar?: number[],
        nuevaDocumentacion?: any
    ) {
        return await EstablecimientoRepository.editarEstablecimiento(
            idEstablecimiento, 
            datosActualizados, 
            nuevasFotos, 
            fotosAEliminar,
            nuevaDocumentacion
        );
    }

    static async getEstadoEstablecimientoUsuario(idUsuario: number): Promise<EstadoEstablecimientoUsuarioDto> {
        try {
            const estadoEstablecimiento = await EstablecimientoRepository.getEstadoEstablecimientoUsuario(idUsuario);
            return estadoEstablecimiento;
        } catch (error) {
            console.error('Error en el servicio de estado de establecimiento del usuario:', error);
            throw error;
        }
    }

    static async activarMembresiaPorPreapproval(preapprovalId: string) {
        try {
            return await EstablecimientoRepository.activarMembresiaPorPreapproval(preapprovalId);
        } catch (error) {
            console.error('Error en el servicio al activar membresía por preapproval:', error);
            throw error;
        }
    }

    static async asociarPreapprovalId(idEstablecimiento: number, preapprovalId: string) {
        try {
            return await EstablecimientoRepository.asociarPreapprovalId(idEstablecimiento, preapprovalId);
        } catch (error) {
            console.error('Error en el servicio al asociar preapproval_id:', error);
            throw error;
        }
    }
}

export default EstablecimientoService; 