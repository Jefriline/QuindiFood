const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

async function consultaDirectaHelado() {
  console.log('🔍 CONSULTA DIRECTA: Helado Cookies & Cream\n');
  
  try {
    // 1. Buscar el producto específico
    console.log('1️⃣ PRODUCTO HELADO COOKIES & CREAM:');
    const queryProducto = `
      SELECT 
        p.id_producto, 
        p.nombre, 
        p.descripcion, 
        p.precio,
        e.id_establecimiento,
        e.nombre_establecimiento, 
        e.estado as estado_establecimiento,
        ce.nombre as categoria_establecimiento,
        cp.nombre as categoria_producto
      FROM producto p
      INNER JOIN establecimiento e ON p.FK_id_establecimiento = e.id_establecimiento
      LEFT JOIN categoria_establecimiento ce ON e.FK_id_categoria_estab = ce.id_categoria_establecimiento
      LEFT JOIN categoria_producto cp ON p.FK_id_categoria_producto = cp.id_categoria_producto
      WHERE LOWER(p.nombre) LIKE '%cookies%' 
         OR LOWER(p.nombre) LIKE '%cream%'
         OR LOWER(p.descripcion) LIKE '%galleta%'
         OR LOWER(p.descripcion) LIKE '%chocolate%';
    `;
    
    const resultProducto = await pool.query(queryProducto);
    console.log('📋 Productos encontrados:', resultProducto.rows);
    console.log('');

    // 2. Verificar la consulta exacta que usa la IA
    console.log('2️⃣ CONSULTA QUE USA LA IA (solo establecimientos aprobados):');
    const queryIA = `
      SELECT DISTINCT
        p.id_producto,
        p.nombre,
        p.precio,
        p.descripcion,
        e.nombre_establecimiento,
        e.ubicacion,
        AVG(pu.valor_puntuado) as calificacion_promedio,
        COUNT(DISTINCT pu.valor_puntuado) as total_calificaciones,
        STRING_AGG(DISTINCT c.cuerpo_comentario, ' | ') as comentarios_usuarios,
        cp.nombre as categoria_producto,
        ce.nombre as categoria_establecimiento
      FROM producto p
      INNER JOIN establecimiento e ON p.FK_id_establecimiento = e.id_establecimiento
      LEFT JOIN puntuacion pu ON e.id_establecimiento = pu.FK_id_establecimiento
      LEFT JOIN comentario c ON e.id_establecimiento = c.FK_id_establecimiento
      LEFT JOIN categoria_producto cp ON p.FK_id_categoria_producto = cp.id_categoria_producto
      LEFT JOIN categoria_establecimiento ce ON e.FK_id_categoria_estab = ce.id_categoria_establecimiento
      WHERE e.estado = 'Aprobado'
        AND (LOWER(p.nombre) LIKE '%cookies%' 
             OR LOWER(p.nombre) LIKE '%cream%'
             OR LOWER(p.descripcion) LIKE '%galleta%'
             OR LOWER(p.descripcion) LIKE '%chocolate%')
      GROUP BY p.id_producto, p.nombre, p.precio, p.descripcion, 
               e.nombre_establecimiento, e.ubicacion, cp.nombre, ce.nombre
      ORDER BY calificacion_promedio DESC;
    `;
    
    const resultIA = await pool.query(queryIA);
    console.log('🤖 Productos que ve la IA:', resultIA.rows);
    console.log('');

    // 3. Estadísticas generales
    console.log('3️⃣ ESTADÍSTICAS GENERALES:');
    const statsQuery = `
      SELECT 
        COUNT(*) as total_productos,
        COUNT(CASE WHEN e.estado = 'Aprobado' THEN 1 END) as productos_aprobados,
        COUNT(CASE WHEN e.estado = 'Pendiente' THEN 1 END) as productos_pendientes,
        COUNT(CASE WHEN e.estado = 'Rechazado' THEN 1 END) as productos_rechazados
      FROM producto p
      INNER JOIN establecimiento e ON p.FK_id_establecimiento = e.id_establecimiento;
    `;
    
    const stats = await pool.query(statsQuery);
    console.log('📊 Estadísticas:', stats.rows[0]);

  } catch (error) {
    console.error('❌ Error en consulta:', error.message);
  } finally {
    await pool.end();
  }
}

consultaDirectaHelado(); 