import CategoriaRepository from '../../repositories/CategoriaRepository/categoriaRepository';

class CategoriaService {
    // ===================== CATEGORÍAS DE ESTABLECIMIENTO =====================
    
    static async getCategoriasEstablecimiento() {
        try {
            console.log('Obteniendo categorías de establecimiento');
            const categorias = await CategoriaRepository.getCategoriasEstablecimiento();
            console.log('Categorías de establecimiento obtenidas exitosamente');
            return categorias;
        } catch (error) {
            console.error('Error en el servicio al obtener categorías de establecimiento:', error);
            throw error;
        }
    }

    static async crearCategoriaEstablecimiento(nombre: string, descripcion?: string) {
        try {
            console.log(`Creando categoría de establecimiento: ${nombre}`);
            const categoria = await CategoriaRepository.crearCategoriaEstablecimiento(nombre, descripcion);
            console.log('Categoría de establecimiento creada exitosamente');
            return categoria;
        } catch (error) {
            console.error('Error en el servicio al crear categoría de establecimiento:', error);
            throw error;
        }
    }

    static async editarCategoriaEstablecimiento(id: number, nombre: string, descripcion?: string) {
        try {
            console.log(`Editando categoría de establecimiento con ID: ${id}`);
            const categoria = await CategoriaRepository.editarCategoriaEstablecimiento(id, nombre, descripcion);
            console.log('Categoría de establecimiento editada exitosamente');
            return categoria;
        } catch (error) {
            console.error('Error en el servicio al editar categoría de establecimiento:', error);
            throw error;
        }
    }

    static async eliminarCategoriaEstablecimiento(id: number) {
        try {
            console.log(`Eliminando categoría de establecimiento con ID: ${id}`);
            const resultado = await CategoriaRepository.eliminarCategoriaEstablecimiento(id);
            console.log('Categoría de establecimiento eliminada exitosamente');
            return resultado;
        } catch (error) {
            console.error('Error en el servicio al eliminar categoría de establecimiento:', error);
            throw error;
        }
    }

    // ===================== CATEGORÍAS DE PRODUCTO =====================

    static async getCategoriasProducto() {
        try {
            console.log('Obteniendo categorías de producto');
            const categorias = await CategoriaRepository.getCategoriasProducto();
            console.log('Categorías de producto obtenidas exitosamente');
            return categorias;
        } catch (error) {
            console.error('Error en el servicio al obtener categorías de producto:', error);
            throw error;
        }
    }

    static async crearCategoriaProducto(nombre: string, descripcion?: string) {
        try {
            console.log(`Creando categoría de producto: ${nombre}`);
            const categoria = await CategoriaRepository.crearCategoriaProducto(nombre, descripcion);
            console.log('Categoría de producto creada exitosamente');
            return categoria;
        } catch (error) {
            console.error('Error en el servicio al crear categoría de producto:', error);
            throw error;
        }
    }

    static async editarCategoriaProducto(id: number, nombre: string, descripcion?: string) {
        try {
            console.log(`Editando categoría de producto con ID: ${id}`);
            const categoria = await CategoriaRepository.editarCategoriaProducto(id, nombre, descripcion);
            console.log('Categoría de producto editada exitosamente');
            return categoria;
        } catch (error) {
            console.error('Error en el servicio al editar categoría de producto:', error);
            throw error;
        }
    }

    static async eliminarCategoriaProducto(id: number) {
        try {
            console.log(`Eliminando categoría de producto con ID: ${id}`);
            const resultado = await CategoriaRepository.eliminarCategoriaProducto(id);
            console.log('Categoría de producto eliminada exitosamente');
            return resultado;
        } catch (error) {
            console.error('Error en el servicio al eliminar categoría de producto:', error);
            throw error;
        }
    }
}

export default CategoriaService; 