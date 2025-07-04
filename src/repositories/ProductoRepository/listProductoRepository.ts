import db from '../../config/config-db';

const listProductos = async () => {
  const productos = await db.query(`
    SELECT 
      p.id_producto, p.nombre, p.precio, p.descripcion,
      COALESCE(mp.imagenes_array, '[]'::json) as imagenes,
      p.FK_id_establecimiento as id_establecimiento,
      e.nombre_establecimiento,
      em.estado as estado_membresia_establecimiento
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
    ORDER BY em.estado DESC, p.id_producto DESC
  `);
  return productos.rows;
};

const getProductoById = async (id: number) => {
  const result = await db.query(`
    SELECT p.id_producto, p.nombre, p.precio, p.descripcion,
      COALESCE(mp.imagenes_array, '[]'::json) as imagenes,
      p.FK_id_establecimiento as id_establecimiento,
      e.nombre_establecimiento,
      em.estado as estado_membresia_establecimiento,
      p.FK_id_categoria_producto as id_categoria,
      cp.nombre as nombre_categoria
    FROM producto p
    JOIN establecimiento e ON p.FK_id_establecimiento = e.id_establecimiento
    JOIN estado_membresia em ON e.id_establecimiento = em.FK_id_establecimiento
    LEFT JOIN categoria_producto cp ON p.FK_id_categoria_producto = cp.id_categoria_producto
    LEFT JOIN (
      SELECT FK_id_producto,
        json_agg(json_build_object('id_imagen', id_multimedia_producto, 'imagen', ref_multimedia)) as imagenes_array
      FROM multimedia_producto
      WHERE ref_multimedia IS NOT NULL AND ref_multimedia <> ''
      GROUP BY FK_id_producto
    ) mp ON p.id_producto = mp.FK_id_producto
    WHERE p.id_producto = $1
  `, [id]);
  return result.rows[0];
};

const getProductoByEstablecimiento = async (id: number) => {
  const result = await db.query(`
    SELECT p.id_producto, p.nombre, p.precio, p.descripcion,
      COALESCE(mp.imagenes_array, '[]'::json) as imagenes,
      p.FK_id_establecimiento as id_establecimiento,
      e.nombre_establecimiento,
      em.estado as estado_membresia_establecimiento
    FROM producto p
    JOIN establecimiento e ON p.FK_id_establecimiento = e.id_establecimiento
    JOIN estado_membresia em ON e.id_establecimiento = em.FK_id_establecimiento
    LEFT JOIN (
      SELECT FK_id_producto,
        json_agg(json_build_object(
          'id_multimedia', id_multimedia_producto,
          'url', ref_multimedia
        )) as imagenes_array
      FROM multimedia_producto
      WHERE tipo = 'foto' AND ref_multimedia IS NOT NULL AND ref_multimedia <> ''
      GROUP BY FK_id_producto
    ) mp ON p.id_producto = mp.FK_id_producto
    WHERE p.FK_id_establecimiento = $1
  `, [id]);

  return result.rows;
};


export default { listProductos, getProductoById, getProductoByEstablecimiento };