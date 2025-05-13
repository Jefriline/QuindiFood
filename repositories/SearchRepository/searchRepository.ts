import db from "../../config/config-db";
import FilterSearchDto from "../../Dto/SearchDto/filterSearchDto";

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

  static async getCategories() {
    const categoriasEstablecimiento = await db.query(`SELECT id_categoria_establecimiento AS id, nombre FROM categoria_establecimiento`);
    const categoriasProducto = await db.query(`SELECT id_categoria_producto AS id, nombre FROM categoria_producto`);
    return {
      categorias_establecimiento: categoriasEstablecimiento.rows,
      categorias_producto: categoriasProducto.rows
    };
  }

  static async filterSearch(filtros: FilterSearchDto) {
    const tipoCocina = filtros.tipoCocina;
    const precioMin = filtros.precioMin;
    const precioMax = filtros.precioMax;
    const valoracionMin = filtros.valoracionMin;
    const disponibleAhora = filtros.disponibleAhora;
    let filtrosSql = [];
    let joins = [];
    let having = [];
    let params = [];

    // Filtro tipo de cocina
    if (tipoCocina) {
      filtrosSql.push(`ce.nombre = $${params.length + 1}`);
      params.push(tipoCocina);
    }

    // Filtro disponibilidad (abiertos o cerrados)
    if (disponibleAhora !== undefined) {
      const dias = ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'];
      const now = new Date();
      const diaSemana = dias[now.getDay()];
      const horaActual = now.toTimeString().slice(0,5); // 'HH:MM'
      
      joins.push(`JOIN horario_establecimiento h ON e.id_establecimiento = h.id_establecimiento`);
      if (disponibleAhora) {
        filtrosSql.push(`h.dia_semana = $${params.length + 1}`);
        params.push(diaSemana);
        filtrosSql.push(`h.hora_apertura <= $${params.length + 1}`);
        params.push(horaActual);
        filtrosSql.push(`h.hora_cierre > $${params.length + 1}`);
        params.push(horaActual);
      } else {
        filtrosSql.push(`h.dia_semana = $${params.length + 1}`);
        params.push(diaSemana);
        const idx1 = params.length + 1;
        params.push(horaActual);
        const idx2 = params.length + 1;
        params.push(horaActual);
        filtrosSql.push(`(h.hora_apertura > $${idx1} OR h.hora_cierre <= $${idx2})`);
      }
    }

    // SIEMPRE agrega el LEFT JOIN de punt
    joins.push(`LEFT JOIN (
      SELECT FK_id_establecimiento, AVG(valor_puntuado) as promedio
      FROM puntuacion
      GROUP BY FK_id_establecimiento
    ) punt ON e.id_establecimiento = punt.FK_id_establecimiento`);

    // Filtro valoración mínima
    if (valoracionMin) {
      having.push(`COALESCE(punt.promedio,0) >= $${params.length + 1}`);
      params.push(valoracionMin);
    }

    // Construir consulta establecimientos
    let sql = `SELECT e.id_establecimiento, e.nombre_establecimiento, e.descripcion, e.ubicacion, ce.nombre AS categoria, me.multimedia AS imagen, em.estado, COALESCE(punt.promedio,0) as promedio
      FROM establecimiento e
      JOIN estado_membresia em ON e.id_establecimiento = em.FK_id_establecimiento
      JOIN categoria_establecimiento ce ON e.FK_id_categoria_estab = ce.id_categoria_establecimiento
      LEFT JOIN multimedia_establecimiento me ON e.id_establecimiento = me.FK_id_establecimiento
      ${joins.join(' ')}
    `;
    if (filtrosSql.length > 0) sql += ' WHERE ' + filtrosSql.join(' AND ');
    sql += ' GROUP BY e.id_establecimiento, ce.nombre, me.multimedia, em.estado, punt.promedio';
    if (having.length > 0) sql += ' HAVING ' + having.join(' AND ');
    sql += ' ORDER BY em.estado DESC';

    const establecimientos = await db.query(sql, params);

    // Filtro productos por precio
    let sqlProd = `SELECT p.id_producto, p.nombre, p.precio, p.descripcion, p.FK_id_establecimiento, e.nombre_establecimiento, mp.ref_foto AS imagen, em.estado
      FROM producto p
      JOIN establecimiento e ON p.FK_id_establecimiento = e.id_establecimiento
      JOIN estado_membresia em ON e.id_establecimiento = em.FK_id_establecimiento
      LEFT JOIN multimedia_producto mp ON p.id_producto = mp.FK_id_producto
    `;
    let filtrosProd = [];
    let paramsProd = [];
    if (precioMin) {
      filtrosProd.push(`p.precio >= $${paramsProd.length + 1}`);
      paramsProd.push(precioMin);
    }
    if (precioMax) {
      filtrosProd.push(`p.precio <= $${paramsProd.length + 1}`);
      paramsProd.push(precioMax);
    }
    if (filtrosProd.length > 0) sqlProd += ' WHERE ' + filtrosProd.join(' AND ');
    sqlProd += ' ORDER BY em.estado DESC';
    const productos = await db.query(sqlProd, paramsProd);

    return { establecimientos: establecimientos.rows, productos: productos.rows };
  }
}

export default SearchRepository; 