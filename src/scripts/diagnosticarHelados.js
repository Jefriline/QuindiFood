const { Pool } = require('pg');
require('dotenv').config();

// Configuración de PostgreSQL
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

async function diagnosticarHelados() {
  console.log('🔍 DIAGNÓSTICO: Búsqueda de Helado Cookies & Cream\n');
  
  try {
    // 1. Buscar productos con "cookies" o "cream" en el nombre
    console.log('1️⃣ PRODUCTOS CON "COOKIES" O "CREAM" EN EL NOMBRE:');
    const queryNombre = `
      SELECT p.id_producto, p.nombre, p.descripcion, p.precio, p.disponible,
             e.nombre_establecimiento, e.estado as estado_establecimiento
      FROM producto p
      INNER JOIN establecimiento e ON p.FK_id_establecimiento = e.id_establecimiento
      WHERE LOWER(p.nombre) LIKE '%cookies%' OR LOWER(p.nombre) LIKE '%cream%'
      ORDER BY p.id_producto;
    `;
    
    const resultNombre = await pool.query(queryNombre);
    if (resultNombre.rows.length > 0) {
      resultNombre.rows.forEach(p => {
        console.log(`   ✅ ID ${p.id_producto}: "${p.nombre}" - $${p.precio}`);
        console.log(`      📍 ${p.nombre_establecimiento} (Estado: ${p.estado_establecimiento})`);
        console.log(`      📝 ${p.descripcion}`);
        console.log(`      🔄 Disponible: ${p.disponible}\n`);
      });
    } else {
      console.log('   ❌ No se encontraron productos con "cookies" o "cream" en el nombre\n');
    }

    // 2. Buscar productos con "galleta" en descripción
    console.log('2️⃣ PRODUCTOS CON "GALLETA" EN LA DESCRIPCIÓN:');
    const queryDescripcion = `
      SELECT p.id_producto, p.nombre, p.descripcion, p.precio, p.disponible,
             e.nombre_establecimiento, e.estado as estado_establecimiento
      FROM producto p
      INNER JOIN establecimiento e ON p.FK_id_establecimiento = e.id_establecimiento
      WHERE LOWER(p.descripcion) LIKE '%galleta%' OR LOWER(p.descripcion) LIKE '%cookie%'
      ORDER BY p.id_producto;
    `;
    
    const resultDesc = await pool.query(queryDescripcion);
    if (resultDesc.rows.length > 0) {
      resultDesc.rows.forEach(p => {
        console.log(`   ✅ ID ${p.id_producto}: "${p.nombre}" - $${p.precio}`);
        console.log(`      📍 ${p.nombre_establecimiento} (Estado: ${p.estado_establecimiento})`);
        console.log(`      📝 ${p.descripcion}`);
        console.log(`      🔄 Disponible: ${p.disponible}\n`);
      });
    } else {
      console.log('   ❌ No se encontraron productos con "galleta" en la descripción\n');
    }

    // 3. Productos que la IA SÍ puede ver (completos)
    console.log('3️⃣ PRODUCTOS QUE LA IA SÍ PUEDE VER (Con categorías y estado aprobado):');
    const queryIA = `
      SELECT 
        p.id_producto,
        p.nombre,
        p.precio,
        p.descripcion,
        p.disponible,
        e.nombre_establecimiento,
        e.estado as estado_establecimiento,
        ce.nombre as categoria_establecimiento,
        cp.nombre as categoria_producto
      FROM producto p
      INNER JOIN establecimiento e ON p.FK_id_establecimiento = e.id_establecimiento
      INNER JOIN categoria_establecimiento ce ON e.FK_id_categoria_estab = ce.id_categoria_establecimiento
      INNER JOIN categoria_producto cp ON p.FK_id_categoria_producto = cp.id_categoria_producto
      WHERE e.estado = 'Aprobado'
        AND (LOWER(p.nombre) LIKE '%helado%' OR LOWER(p.nombre) LIKE '%cookies%' OR LOWER(p.nombre) LIKE '%cream%')
      ORDER BY p.id_producto;
    `;
    
    const resultIA = await pool.query(queryIA);
    if (resultIA.rows.length > 0) {
      resultIA.rows.forEach(p => {
        console.log(`   ✅ ID ${p.id_producto}: "${p.nombre}" - $${p.precio}`);
        console.log(`      📍 ${p.nombre_establecimiento} (${p.estado_establecimiento})`);
        console.log(`      🏷️ ${p.categoria_establecimiento} → ${p.categoria_producto}`);
        console.log(`      📝 ${p.descripcion}`);
        console.log(`      🔄 Disponible: ${p.disponible}\n`);
      });
    } else {
      console.log('   ❌ NO hay productos de helado que la IA pueda ver\n');
    }

    // 4. Simular búsqueda exacta de la IA
    console.log('4️⃣ SIMULACIÓN DE BÚSQUEDA IA: "helado cookies cream galleta chocolate"');
    const busquedaIA = `
      SELECT 
        p.id_producto,
        p.nombre,
        p.precio,
        p.descripcion,
        e.nombre_establecimiento,
        CASE 
          WHEN LOWER(p.nombre) LIKE '%cookies%' THEN 2.0
          WHEN LOWER(p.nombre) LIKE '%cream%' THEN 2.0
          WHEN LOWER(p.nombre) LIKE '%helado%' THEN 2.0
          ELSE 0
        END +
        CASE 
          WHEN LOWER(p.descripcion) LIKE '%galleta%' THEN 1.0
          WHEN LOWER(p.descripcion) LIKE '%chocolate%' THEN 1.0
          WHEN LOWER(p.descripcion) LIKE '%cookies%' THEN 1.0
          WHEN LOWER(p.descripcion) LIKE '%cream%' THEN 1.0
          ELSE 0
        END as score_total
      FROM producto p
      INNER JOIN establecimiento e ON p.FK_id_establecimiento = e.id_establecimiento
      INNER JOIN categoria_establecimiento ce ON e.FK_id_categoria_estab = ce.id_categoria_establecimiento
      INNER JOIN categoria_producto cp ON p.FK_id_categoria_producto = cp.id_categoria_producto
      WHERE e.estado = 'Aprobado'
        AND (
          LOWER(p.nombre) LIKE '%helado%' OR LOWER(p.nombre) LIKE '%cookies%' OR LOWER(p.nombre) LIKE '%cream%'
          OR LOWER(p.descripcion) LIKE '%helado%' OR LOWER(p.descripcion) LIKE '%galleta%' OR LOWER(p.descripcion) LIKE '%chocolate%'
        )
      ORDER BY score_total DESC, p.precio ASC;
    `;
    
    const resultBusqueda = await pool.query(busquedaIA);
    if (resultBusqueda.rows.length > 0) {
      console.log('   🎯 RESULTADOS ORDENADOS POR RELEVANCIA:');
      resultBusqueda.rows.forEach((p, i) => {
        console.log(`   ${i+1}. "${p.nombre}" - $${p.precio} (Score: ${p.score_total})`);
        console.log(`      📍 ${p.nombre_establecimiento}`);
        console.log(`      📝 ${p.descripcion}\n`);
      });
    } else {
      console.log('   ❌ LA IA NO ENCUENTRA NADA\n');
    }

    // 5. Verificar problema específico del ID 33
    console.log('5️⃣ VERIFICACIÓN ESPECÍFICA DEL PRODUCTO ID 33:');
    const queryID33 = `
      SELECT 
        p.id_producto,
        p.nombre,
        p.precio,
        p.descripcion,
        p.disponible,
        e.nombre_establecimiento,
        e.estado as estado_establecimiento,
        e.id_establecimiento,
        ce.nombre as categoria_establecimiento,
        cp.nombre as categoria_producto,
        CASE 
          WHEN ce.id_categoria_establecimiento IS NULL THEN 'FALTA CATEGORÍA ESTABLECIMIENTO'
          WHEN cp.id_categoria_producto IS NULL THEN 'FALTA CATEGORÍA PRODUCTO'
          WHEN e.estado != 'Aprobado' THEN 'ESTABLECIMIENTO NO APROBADO'
          WHEN p.disponible = false THEN 'PRODUCTO NO DISPONIBLE'
          ELSE 'DEBE APARECER EN IA'
        END as diagnostico
      FROM producto p
      LEFT JOIN establecimiento e ON p.FK_id_establecimiento = e.id_establecimiento
      LEFT JOIN categoria_establecimiento ce ON e.FK_id_categoria_estab = ce.id_categoria_establecimiento
      LEFT JOIN categoria_producto cp ON p.FK_id_categoria_producto = cp.id_categoria_producto
      WHERE p.id_producto = 33;
    `;
    
    const resultID33 = await pool.query(queryID33);
    if (resultID33.rows.length > 0) {
      const p = resultID33.rows[0];
      console.log(`   🔍 PRODUCTO ID 33: "${p.nombre}"`);
      console.log(`      💰 Precio: $${p.precio}`);
      console.log(`      📝 Descripción: ${p.descripcion}`);
      console.log(`      🏪 Establecimiento: ${p.nombre_establecimiento} (ID: ${p.id_establecimiento})`);
      console.log(`      🟢 Estado Establecimiento: ${p.estado_establecimiento}`);
      console.log(`      🏷️ Categoría Establecimiento: ${p.categoria_establecimiento}`);
      console.log(`      🏷️ Categoría Producto: ${p.categoria_producto}`);
      console.log(`      🔄 Disponible: ${p.disponible}`);
      console.log(`      🎯 DIAGNÓSTICO: ${p.diagnostico}\n`);
    } else {
      console.log('   ❌ NO EXISTE EL PRODUCTO ID 33\n');
    }

  } catch (error) {
    console.error('❌ Error en diagnóstico:', error);
  } finally {
    await pool.end();
  }
}

diagnosticarHelados().catch(console.error); 