const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

async function debugBusquedaEspecifica() {
  console.log('🔍 DEBUG: ¿Por qué no encuentra "Helado Cookies & Cream"?\n');
  
  try {
    // 1. Buscar el producto específico
    console.log('1️⃣ PRODUCTO ID 33 - DATOS COMPLETOS:');
    const queryProducto = `
      SELECT 
        p.id_producto,
        p.nombre,
        p.precio,
        p.descripcion,
        p.FK_id_establecimiento,
        p.FK_id_categoria_producto,
        e.nombre_establecimiento,
        e.estado as estado_establecimiento,
        e.FK_id_categoria_estab,
        ce.nombre as categoria_establecimiento,
        cp.nombre as categoria_producto
      FROM producto p
      INNER JOIN establecimiento e ON p.FK_id_establecimiento = e.id_establecimiento
      LEFT JOIN categoria_establecimiento ce ON e.FK_id_categoria_estab = ce.id_categoria_establecimiento
      LEFT JOIN categoria_producto cp ON p.FK_id_categoria_producto = cp.id_categoria_producto
      WHERE p.id_producto = 33;
    `;
    
    const producto = await pool.query(queryProducto);
    console.log('📋 Datos del producto:', producto.rows[0]);
    console.log('');

    // 2. Simular la consulta EXACTA que usa la IA
    console.log('2️⃣ CONSULTA EXACTA QUE USA LA IA:');
    const queryIA = `
      SELECT 
        p.id_producto,
        p.nombre,
        p.precio,
        p.descripcion,
        e.nombre_establecimiento,
        e.ubicacion,
        ce.nombre as categoria_establecimiento,
        cp.nombre as categoria_producto
      FROM producto p
      INNER JOIN establecimiento e ON p.FK_id_establecimiento = e.id_establecimiento
      INNER JOIN categoria_establecimiento ce ON e.FK_id_categoria_estab = ce.id_categoria_establecimiento
      INNER JOIN categoria_producto cp ON p.FK_id_categoria_producto = cp.id_categoria_producto
      WHERE e.estado = 'Aprobado'
        AND p.id_producto = 33;
    `;
    
    const resultIA = await pool.query(queryIA);
    console.log('🤖 ¿La IA ve este producto?', resultIA.rows.length > 0 ? 'SÍ' : 'NO');
    if (resultIA.rows.length > 0) {
      console.log('📊 Datos que ve la IA:', resultIA.rows[0]);
    } else {
      console.log('❌ La IA NO ve este producto por los INNER JOINs');
    }
    console.log('');

    // 3. Simular búsqueda por texto
    console.log('3️⃣ SIMULACIÓN DE BÚSQUEDA POR TEXTO:');
    const palabrasBusqueda = ['helado', 'trozos', 'galleta', 'chocolate'];
    
    for (const palabra of palabrasBusqueda) {
      const queryTexto = `
        SELECT COUNT(*) as encontrados
        FROM producto p
        INNER JOIN establecimiento e ON p.FK_id_establecimiento = e.id_establecimiento
        INNER JOIN categoria_establecimiento ce ON e.FK_id_categoria_estab = ce.id_categoria_establecimiento
        INNER JOIN categoria_producto cp ON p.FK_id_categoria_producto = cp.id_categoria_producto
        WHERE e.estado = 'Aprobado'
          AND (
            LOWER(p.nombre) LIKE '%${palabra}%' 
            OR LOWER(p.descripcion) LIKE '%${palabra}%'
          );
      `;
      
      const result = await pool.query(queryTexto);
      console.log(`   🔍 Búsqueda "${palabra}": ${result.rows[0].encontrados} productos encontrados`);
    }
    
    // 4. Búsqueda específica del cookies cream
    console.log('');
    console.log('4️⃣ BÚSQUEDA ESPECÍFICA "COOKIES" Y "CREAM":');
    const queryCookiesCream = `
      SELECT p.id_producto, p.nombre, p.descripcion
      FROM producto p
      INNER JOIN establecimiento e ON p.FK_id_establecimiento = e.id_establecimiento
      INNER JOIN categoria_establecimiento ce ON e.FK_id_categoria_estab = ce.id_categoria_establecimiento
      INNER JOIN categoria_producto cp ON p.FK_id_categoria_producto = cp.id_categoria_producto
      WHERE e.estado = 'Aprobado'
        AND (
          LOWER(p.nombre) LIKE '%cookies%' 
          OR LOWER(p.nombre) LIKE '%cream%'
          OR LOWER(p.descripcion) LIKE '%galleta%'
          OR LOWER(p.descripcion) LIKE '%chocolate%'
        );
    `;
    
    const resultCookies = await pool.query(queryCookiesCream);
    console.log('🍪 Productos con "cookies", "cream", "galleta" o "chocolate":');
    resultCookies.rows.forEach(p => {
      console.log(`   ID ${p.id_producto}: ${p.nombre}`);
      console.log(`   📝 ${p.descripcion}`);
      console.log('');
    });

  } catch (error) {
    console.error('❌ Error en debug:', error.message);
  } finally {
    await pool.end();
  }
}

debugBusquedaEspecifica(); 