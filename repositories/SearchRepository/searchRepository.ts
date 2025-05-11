import db from "../../config/config-db";

class SearchRepository {
  static async getEstablecimientosYProductosActivos(): Promise<{ establecimientos: any[], productos: any[] }> {
    // Traer establecimientos con membresía activa
    const establecimientos = await db.query(`
      SELECT e.id_establecimiento, e.nombre_establecimiento, e.descripcion, e.ubicacion, ce.nombre AS categoria, me.multimedia AS imagen, em.estado
      FROM establecimiento e
      JOIN estado_membresia em ON e.id_establecimiento = em.FK_id_establecimiento
      JOIN categoria_establecimiento ce ON e.FK_id_categoria_estab = ce.id_categoria_establecimiento
      LEFT JOIN multimedia_establecimiento me ON e.id_establecimiento = me.FK_id_establecimiento
      ORDER BY em.estado ASC
    `);

    // Traer productos cuyos establecimientos tengan membresía activa
    const productos = await db.query(`
      SELECT p.id_producto, p.nombre, p.precio, p.descripcion, p.FK_id_establecimiento, e.nombre_establecimiento, mp.ref_foto AS imagen, em.estado
      FROM producto p
      JOIN establecimiento e ON p.FK_id_establecimiento = e.id_establecimiento
      JOIN estado_membresia em ON e.id_establecimiento = em.FK_id_establecimiento
      LEFT JOIN multimedia_producto mp ON p.id_producto = mp.FK_id_producto
      ORDER BY em.estado ASC
    `);

    return { establecimientos: establecimientos.rows, productos: productos.rows };
  }
}

export default SearchRepository; 