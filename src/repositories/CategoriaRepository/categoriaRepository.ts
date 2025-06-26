import db from '../../config/config-db';

class CategoriaRepository {
    // ===================== CATEGORÍAS DE ESTABLECIMIENTO =====================
    
    static async getCategoriasEstablecimiento() {
        try {
            const sql = `
                SELECT 
                    id_categoria_establecimiento,
                    nombre,
                    descripcion
                FROM categoria_establecimiento
                ORDER BY nombre ASC
            `;
            const result = await db.query(sql);
            return result.rows;
        } catch (error) {
            console.error('Error al obtener categorías de establecimiento:', error);
            throw error;
        }
    }

    static async crearCategoriaEstablecimiento(nombre: string, descripcion?: string) {
        try {
            // Verificar si ya existe una categoría con ese nombre
            const existeCategoria = await db.query(
                'SELECT 1 FROM categoria_establecimiento WHERE LOWER(nombre) = LOWER($1)',
                [nombre]
            );

            if (existeCategoria.rowCount && existeCategoria.rowCount > 0) {
                throw new Error('Ya existe una categoría de establecimiento con ese nombre');
            }

            const sql = `
                INSERT INTO categoria_establecimiento (nombre, descripcion)
                VALUES ($1, $2)
                RETURNING id_categoria_establecimiento, nombre, descripcion
            `;
            
            const result = await db.query(sql, [nombre, descripcion || null]);
            return result.rows[0];
        } catch (error) {
            console.error('Error al crear categoría de establecimiento:', error);
            throw error;
        }
    }

    static async editarCategoriaEstablecimiento(id: number, nombre: string, descripcion?: string) {
        try {
            // Verificar que la categoría existe
            const categoriaExiste = await db.query(
                'SELECT 1 FROM categoria_establecimiento WHERE id_categoria_establecimiento = $1',
                [id]
            );

            if (!categoriaExiste.rowCount || categoriaExiste.rowCount === 0) {
                throw new Error('La categoría de establecimiento no existe');
            }

            // Verificar si ya existe otra categoría con ese nombre
            const existeOtraCategoria = await db.query(
                'SELECT 1 FROM categoria_establecimiento WHERE LOWER(nombre) = LOWER($1) AND id_categoria_establecimiento != $2',
                [nombre, id]
            );

            if (existeOtraCategoria.rowCount && existeOtraCategoria.rowCount > 0) {
                throw new Error('Ya existe otra categoría de establecimiento con ese nombre');
            }

            const sql = `
                UPDATE categoria_establecimiento 
                SET nombre = $1, descripcion = $2
                WHERE id_categoria_establecimiento = $3
                RETURNING id_categoria_establecimiento, nombre, descripcion
            `;
            
            const result = await db.query(sql, [nombre, descripcion || null, id]);
            return result.rows[0];
        } catch (error) {
            console.error('Error al editar categoría de establecimiento:', error);
            throw error;
        }
    }

    static async eliminarCategoriaEstablecimiento(id: number) {
        try {
            // Verificar si hay establecimientos usando esta categoría
            const establecimientosUsandoCategoria = await db.query(
                'SELECT COUNT(*) as total FROM establecimiento WHERE FK_id_categoria_estab = $1',
                [id]
            );

            if (parseInt(establecimientosUsandoCategoria.rows[0].total) > 0) {
                throw new Error('No se puede eliminar la categoría porque hay establecimientos que la utilizan');
            }

            const sql = 'DELETE FROM categoria_establecimiento WHERE id_categoria_establecimiento = $1 RETURNING nombre';
            const result = await db.query(sql, [id]);
            
            if (!result.rowCount || result.rowCount === 0) {
                throw new Error('La categoría de establecimiento no existe');
            }

            return { eliminado: true, nombre: result.rows[0].nombre };
        } catch (error) {
            console.error('Error al eliminar categoría de establecimiento:', error);
            throw error;
        }
    }

    // ===================== CATEGORÍAS DE PRODUCTO =====================

    static async getCategoriasProducto() {
        try {
            const sql = `
                SELECT 
                    id_categoria_producto,
                    nombre,
                    descripcion
                FROM categoria_producto
                ORDER BY nombre ASC
            `;
            const result = await db.query(sql);
            return result.rows;
        } catch (error) {
            console.error('Error al obtener categorías de producto:', error);
            throw error;
        }
    }

    static async crearCategoriaProducto(nombre: string, descripcion?: string) {
        try {
            // Verificar si ya existe una categoría con ese nombre
            const existeCategoria = await db.query(
                'SELECT 1 FROM categoria_producto WHERE LOWER(nombre) = LOWER($1)',
                [nombre]
            );

            if (existeCategoria.rowCount && existeCategoria.rowCount > 0) {
                throw new Error('Ya existe una categoría de producto con ese nombre');
            }

            const sql = `
                INSERT INTO categoria_producto (nombre, descripcion)
                VALUES ($1, $2)
                RETURNING id_categoria_producto, nombre, descripcion
            `;
            
            const result = await db.query(sql, [nombre, descripcion || null]);
            return result.rows[0];
        } catch (error) {
            console.error('Error al crear categoría de producto:', error);
            throw error;
        }
    }

    static async editarCategoriaProducto(id: number, nombre: string, descripcion?: string) {
        try {
            // Verificar que la categoría existe
            const categoriaExiste = await db.query(
                'SELECT 1 FROM categoria_producto WHERE id_categoria_producto = $1',
                [id]
            );

            if (!categoriaExiste.rowCount || categoriaExiste.rowCount === 0) {
                throw new Error('La categoría de producto no existe');
            }

            // Verificar si ya existe otra categoría con ese nombre
            const existeOtraCategoria = await db.query(
                'SELECT 1 FROM categoria_producto WHERE LOWER(nombre) = LOWER($1) AND id_categoria_producto != $2',
                [nombre, id]
            );

            if (existeOtraCategoria.rowCount && existeOtraCategoria.rowCount > 0) {
                throw new Error('Ya existe otra categoría de producto con ese nombre');
            }

            const sql = `
                UPDATE categoria_producto 
                SET nombre = $1, descripcion = $2
                WHERE id_categoria_producto = $3
                RETURNING id_categoria_producto, nombre, descripcion
            `;
            
            const result = await db.query(sql, [nombre, descripcion || null, id]);
            return result.rows[0];
        } catch (error) {
            console.error('Error al editar categoría de producto:', error);
            throw error;
        }
    }

    static async eliminarCategoriaProducto(id: number) {
        try {
            // Verificar si hay productos usando esta categoría
            const productosUsandoCategoria = await db.query(
                'SELECT COUNT(*) as total FROM producto WHERE FK_id_categoria_producto = $1',
                [id]
            );

            if (parseInt(productosUsandoCategoria.rows[0].total) > 0) {
                throw new Error('No se puede eliminar la categoría porque hay productos que la utilizan');
            }

            const sql = 'DELETE FROM categoria_producto WHERE id_categoria_producto = $1 RETURNING nombre';
            const result = await db.query(sql, [id]);
            
            if (!result.rowCount || result.rowCount === 0) {
                throw new Error('La categoría de producto no existe');
            }

            return { eliminado: true, nombre: result.rows[0].nombre };
        } catch (error) {
            console.error('Error al eliminar categoría de producto:', error);
            throw error;
        }
    }
}

export default CategoriaRepository; 