import PromocionRepository from '../../repositories/PromocionRepository/promocionRepository';
import EstablecimientoRepository from '../../repositories/EstablecimientoRepository/establecimientoRepository';

class PromocionService {
    static async crearPromocion(data: any, idUsuario: number) {
        try {
            console.log('Iniciando proceso de creación de promoción');
            
            // Buscar el establecimiento del usuario
            const establecimiento = await EstablecimientoRepository.getMiEstablecimiento(idUsuario);
            if (!establecimiento) {
                throw new Error('No tienes un establecimiento registrado');
            }
            
            const promocionData = {
                ...data,
                FK_id_establecimiento: establecimiento.id_establecimiento
            };
            
            const resultado = await PromocionRepository.crearPromocion(promocionData);
            console.log('Promoción creada exitosamente');
            
            return resultado;
        } catch (error) {
            console.error('Error en el servicio al crear promoción:', error);
            throw error;
        }
    }

    static async getPromocionesByEstablecimiento(idUsuario: number) {
        try {
            console.log('Iniciando proceso de obtención de promociones del establecimiento');
            
            // Buscar el establecimiento del usuario
            const establecimiento = await EstablecimientoRepository.getMiEstablecimiento(idUsuario);
            if (!establecimiento) {
                throw new Error('No tienes un establecimiento registrado');
            }
            
            const promociones = await PromocionRepository.getPromocionesByEstablecimiento(establecimiento.id_establecimiento);
            console.log('Promociones obtenidas exitosamente');
            
            return promociones;
        } catch (error) {
            console.error('Error en el servicio al obtener promociones:', error);
            throw error;
        }
    }

    static async getPromocionById(idPromocion: number, idUsuario: number) {
        try {
            console.log(`Iniciando proceso de obtención de la promoción con ID: ${idPromocion}`);
            
            // Buscar el establecimiento del usuario
            const establecimiento = await EstablecimientoRepository.getMiEstablecimiento(idUsuario);
            if (!establecimiento) {
                throw new Error('No tienes un establecimiento registrado');
            }
            
            const promocion = await PromocionRepository.getPromocionById(idPromocion, establecimiento.id_establecimiento);
            console.log('Promoción obtenida exitosamente');
            
            return promocion;
        } catch (error) {
            console.error('Error en el servicio al obtener promoción:', error);
            throw error;
        }
    }

    static async editarPromocion(
        idPromocion: number,
        idUsuario: number,
        datosActualizados: any
    ) {
        try {
            console.log(`Iniciando proceso de edición de la promoción con ID: ${idPromocion}`);
            
            // Buscar el establecimiento del usuario
            const establecimiento = await EstablecimientoRepository.getMiEstablecimiento(idUsuario);
            if (!establecimiento) {
                throw new Error('No tienes un establecimiento registrado');
            }
            
            const resultado = await PromocionRepository.editarPromocion(
                idPromocion,
                establecimiento.id_establecimiento,
                datosActualizados
            );
            console.log('Promoción editada exitosamente');
            
            return resultado;
        } catch (error) {
            console.error('Error en el servicio al editar promoción:', error);
            throw error;
        }
    }

    static async eliminarPromocion(idPromocion: number, idUsuario: number) {
        try {
            console.log(`Iniciando proceso de eliminación de la promoción con ID: ${idPromocion}`);
            
            // Buscar el establecimiento del usuario
            const establecimiento = await EstablecimientoRepository.getMiEstablecimiento(idUsuario);
            if (!establecimiento) {
                throw new Error('No tienes un establecimiento registrado');
            }
            
            const resultado = await PromocionRepository.eliminarPromocion(idPromocion, establecimiento.id_establecimiento);
            console.log('Promoción eliminada exitosamente');
            
            return resultado;
        } catch (error) {
            console.error('Error en el servicio al eliminar promoción:', error);
            throw error;
        }
    }

    static async getPromocionesActivasPublicas() {
        try {
            console.log('Obteniendo promociones activas públicas');
            const promociones = await PromocionRepository.getPromocionesActivasPublicas();
            console.log('Promociones activas obtenidas exitosamente');
            return promociones;
        } catch (error) {
            console.error('Error en el servicio al obtener promociones activas:', error);
            throw error;
        }
    }
}

export default PromocionService; 