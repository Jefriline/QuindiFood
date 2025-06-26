import ProductoRepository from '../../repositories/ProductoRepository/productoRepository';
import EstablecimientoRepository from '../../repositories/EstablecimientoRepository/establecimientoRepository';

class ProductoService {
    static async crearProducto(data: any, idUsuario: number) {
        try {
            console.log('Iniciando proceso de creación de producto');
            
            // Buscar el establecimiento del usuario
            const establecimiento = await EstablecimientoRepository.getMiEstablecimiento(idUsuario);
            if (!establecimiento) {
                throw new Error('No tienes un establecimiento registrado');
            }
            
            const productoData = {
                ...data,
                FK_id_establecimiento: establecimiento.id_establecimiento
            };
            
            const resultado = await ProductoRepository.crearProducto(productoData);
            console.log('Producto creado exitosamente');
            
            return resultado;
        } catch (error) {
            console.error('Error en el servicio al crear producto:', error);
            throw error;
        }
    }

    static async getProductosByEstablecimiento(idUsuario: number) {
        try {
            console.log('Iniciando proceso de obtención de productos del establecimiento');
            
            // Buscar el establecimiento del usuario
            const establecimiento = await EstablecimientoRepository.getMiEstablecimiento(idUsuario);
            if (!establecimiento) {
                throw new Error('No tienes un establecimiento registrado');
            }
            
            const productos = await ProductoRepository.getProductosByEstablecimiento(establecimiento.id_establecimiento);
            console.log('Productos obtenidos exitosamente');
            
            return productos;
        } catch (error) {
            console.error('Error en el servicio al obtener productos:', error);
            throw error;
        }
    }

    static async getProductoById(idProducto: number, idUsuario: number) {
        try {
            console.log(`Iniciando proceso de obtención del producto con ID: ${idProducto}`);
            
            // Buscar el establecimiento del usuario
            const establecimiento = await EstablecimientoRepository.getMiEstablecimiento(idUsuario);
            if (!establecimiento) {
                throw new Error('No tienes un establecimiento registrado');
            }
            
            const producto = await ProductoRepository.getProductoById(idProducto, establecimiento.id_establecimiento);
            console.log('Producto obtenido exitosamente');
            
            return producto;
        } catch (error) {
            console.error('Error en el servicio al obtener producto:', error);
            throw error;
        }
    }

    static async editarProducto(
        idProducto: number,
        idUsuario: number,
        datosActualizados: any,
        nuevaMultimedia?: { tipo: 'foto' | 'video', ref: string }[],
        multimediaAEliminar?: number[]
    ) {
        try {
            console.log(`Iniciando proceso de edición del producto con ID: ${idProducto}`);
            
            // Buscar el establecimiento del usuario
            const establecimiento = await EstablecimientoRepository.getMiEstablecimiento(idUsuario);
            if (!establecimiento) {
                throw new Error('No tienes un establecimiento registrado');
            }
            
            const resultado = await ProductoRepository.editarProducto(
                idProducto,
                establecimiento.id_establecimiento,
                datosActualizados,
                nuevaMultimedia,
                multimediaAEliminar
            );
            console.log('Producto editado exitosamente');
            
            return resultado;
        } catch (error) {
            console.error('Error en el servicio al editar producto:', error);
            throw error;
        }
    }

    static async eliminarProducto(idProducto: number, idUsuario: number) {
        try {
            console.log(`Iniciando proceso de eliminación del producto con ID: ${idProducto}`);
            
            // Buscar el establecimiento del usuario
            const establecimiento = await EstablecimientoRepository.getMiEstablecimiento(idUsuario);
            if (!establecimiento) {
                throw new Error('No tienes un establecimiento registrado');
            }
            
            const resultado = await ProductoRepository.eliminarProducto(idProducto, establecimiento.id_establecimiento);
            console.log('Producto eliminado exitosamente');
            
            return resultado;
        } catch (error) {
            console.error('Error en el servicio al eliminar producto:', error);
            throw error;
        }
    }
}

export default ProductoService; 