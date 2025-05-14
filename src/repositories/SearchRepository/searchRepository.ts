import db from "../../config/config-db";


class SearchRepository {
  static async getEstablecimientosYProductosActivos(): Promise<{ establecimientos: any[], productos: any[] }> {
    // Traer establecimientos con membresía activa
    let innerSql = `
      SELECT e.id_establecimiento, e.nombre_establecimiento, e.descripcion, e.ubicacion,
        ce.id_categoria_establecimiento,
        ce.nombre AS categoria,
        COALESCE(ia.imagenes_array, '[]'::json) as imagenes,
        em.estado,
        COALESCE(punt.promedio,0) as promedio_calificacion,
        COALESCE(punt.total,0) as total_puntuaciones,
        COALESCE(horarios.horarios_array, '[]'::json) as horarios
      FROM establecimiento e
      JOIN estado_membresia em ON e.id_establecimiento = em.FK_id_establecimiento
      JOIN categoria_establecimiento ce ON e.FK_id_categoria_estab = ce.id_categoria_establecimiento
      LEFT JOIN (
        SELECT FK_id_establecimiento,
          json_agg(json_build_object('id_imagen', id_multimedia_estab, 'imagen', multimedia)) as imagenes_array
        FROM multimedia_establecimiento
        WHERE multimedia IS NOT NULL AND multimedia <> ''
        GROUP BY FK_id_establecimiento
      ) ia ON e.id_establecimiento = ia.FK_id_establecimiento
      LEFT JOIN (
        SELECT id_establecimiento,
          json_agg(json_build_object('dia_semana', dia_semana, 'hora_apertura', hora_apertura, 'hora_cierre', hora_cierre) ORDER BY 
            CASE dia_semana
              WHEN 'Lunes' THEN 1
              WHEN 'Martes' THEN 2
              WHEN 'Miércoles' THEN 3
              WHEN 'Jueves' THEN 4
              WHEN 'Viernes' THEN 5
              WHEN 'Sábado' THEN 6
              WHEN 'Domingo' THEN 7
            END
          ) as horarios_array
        FROM horario_establecimiento
        GROUP BY id_establecimiento
      ) horarios ON e.id_establecimiento = horarios.id_establecimiento
      LEFT JOIN (
        SELECT FK_id_establecimiento, AVG(valor_puntuado) as promedio, COUNT(*) as total
        FROM puntuacion
        GROUP BY FK_id_establecimiento
      ) punt ON e.id_establecimiento = punt.FK_id_establecimiento
    `;

    const establecimientos = await db.query(innerSql);

    // Traer productos cuyos establecimientos tengan membresía activa
    const productos = await db.query(`
      SELECT p.id_producto, p.nombre, p.precio, p.descripcion, p.FK_id_establecimiento, e.nombre_establecimiento,
        COALESCE(mp.imagenes_array, '[]'::json) as imagenes,
        em.estado
      FROM producto p
      JOIN establecimiento e ON p.FK_id_establecimiento = e.id_establecimiento
      JOIN estado_membresia em ON e.id_establecimiento = em.FK_id_establecimiento
      LEFT JOIN (
        SELECT FK_id_producto,
          json_agg(json_build_object('id_imagen', id_multimedia_producto, 'imagen', ref_multimedia)) as imagenes_array
        FROM multimedia_producto
        WHERE ref_multimedia IS NOT NULL AND ref_multimedia <> ''
        GROUP BY FK_id_producto
      ) mp ON p.id_producto = mp.FK_id_producto
      LEFT JOIN horario_establecimiento h ON e.id_establecimiento = h.id_establecimiento
      ORDER BY em.estado ASC
    `);

    return { establecimientos: establecimientos.rows, productos: productos.rows };
  }

  static async getCategories() {
    const categoriasEstablecimiento = await db.query(`SELECT id_categoria_establecimiento AS id, nombre, descripcion FROM categoria_establecimiento`);
    const categoriasProducto = await db.query(`SELECT id_categoria_producto AS id, nombre, descripcion FROM categoria_producto`);
    return {
      categorias_establecimiento: categoriasEstablecimiento.rows,
      categorias_producto: categoriasProducto.rows
    };
  }


   static async getEstablecimientosYProductosActivosForFilter(): Promise<{ establecimientos: any[], productos: any[] }> {
    // Traer establecimientos con membresía activa
    let innerSql = `
      SELECT e.id_establecimiento, e.nombre_establecimiento, e.descripcion, e.ubicacion,
        ce.id_categoria_establecimiento,
        ce.nombre AS categoria,
        COALESCE(ia.imagenes_array, '[]'::json) as imagenes,
        em.estado,
        COALESCE(punt.promedio,0) as promedio_calificacion,
        COALESCE(punt.total,0) as total_puntuaciones,
        COALESCE(horarios.horarios_array, '[]'::json) as horarios
      FROM establecimiento e
      JOIN estado_membresia em ON e.id_establecimiento = em.FK_id_establecimiento
      JOIN categoria_establecimiento ce ON e.FK_id_categoria_estab = ce.id_categoria_establecimiento
      LEFT JOIN (
        SELECT FK_id_establecimiento,
          json_agg(json_build_object('id_imagen', id_multimedia_estab, 'imagen', multimedia)) as imagenes_array
        FROM multimedia_establecimiento
        WHERE multimedia IS NOT NULL AND multimedia <> ''
        GROUP BY FK_id_establecimiento
      ) ia ON e.id_establecimiento = ia.FK_id_establecimiento
      LEFT JOIN (
        SELECT id_establecimiento,
          json_agg(json_build_object('dia_semana', dia_semana, 'hora_apertura', hora_apertura, 'hora_cierre', hora_cierre) ORDER BY 
            CASE dia_semana
              WHEN 'Lunes' THEN 1
              WHEN 'Martes' THEN 2
              WHEN 'Miércoles' THEN 3
              WHEN 'Jueves' THEN 4
              WHEN 'Viernes' THEN 5
              WHEN 'Sábado' THEN 6
              WHEN 'Domingo' THEN 7
            END
          ) as horarios_array
        FROM horario_establecimiento
        GROUP BY id_establecimiento
      ) horarios ON e.id_establecimiento = horarios.id_establecimiento
      LEFT JOIN (
        SELECT FK_id_establecimiento, AVG(valor_puntuado) as promedio, COUNT(*) as total
        FROM puntuacion
        GROUP BY FK_id_establecimiento
      ) punt ON e.id_establecimiento = punt.FK_id_establecimiento
    `;

    const establecimientos = await db.query(innerSql);

    // Traer productos cuyos establecimientos tengan membresía activa
    const productos = await db.query(`
      SELECT p.id_producto, p.nombre, p.precio, p.descripcion, p.FK_id_establecimiento, e.nombre_establecimiento,
        ce.nombre AS categoria,  -- Aquí se agrega la categoría del establecimiento
        COALESCE(mp.imagenes_array, '[]'::json) as imagenes,
        em.estado
      FROM producto p
      JOIN establecimiento e ON p.FK_id_establecimiento = e.id_establecimiento
      JOIN estado_membresia em ON e.id_establecimiento = em.FK_id_establecimiento
      JOIN categoria_establecimiento ce ON e.FK_id_categoria_estab = ce.id_categoria_establecimiento -- Unión para obtener la categoría
      LEFT JOIN (
        SELECT FK_id_producto,
          json_agg(json_build_object('id_imagen', id_multimedia_producto, 'imagen', ref_multimedia)) as imagenes_array
        FROM multimedia_producto
        WHERE ref_multimedia IS NOT NULL AND ref_multimedia <> ''
        GROUP BY FK_id_producto
      ) mp ON p.id_producto = mp.FK_id_producto
      LEFT JOIN horario_establecimiento h ON e.id_establecimiento = h.id_establecimiento
      ORDER BY em.estado ASC
    `);

    return { establecimientos: establecimientos.rows, productos: productos.rows };
}

  
}

export default SearchRepository; 