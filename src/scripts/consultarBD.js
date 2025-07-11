const { Pool } = require('pg');
require('dotenv').config();

async function consultarBD() {
  const pool = new Pool({
    host: process.env.DB_HOST,
    user: process.env.DB_USERNAME,
    port: parseInt(process.env.DB_PORT || '5432'),
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  });

  console.log('🔍 CONSULTANDO TODA LA BASE DE DATOS PostgreSQL...\n');

  const tablas = [
    'usuario_general', 'cliente', 'propietario_establecimiento', 'administrador_sistema',
    'categoria_establecimiento', 'categoria_producto', 'establecimiento', 
    'documentacion_establecimiento', 'estado_membresia', 'multimedia_establecimiento',
    'producto', 'multimedia_producto', 'promocion', 'puntuacion', 'favorito', 
    'comentario', 'evento', 'gestiona', 'participacion_evento', 'patrocinador_evento',
    'interactua', 'horario_establecimiento', 'password_reset_codes', 'actividad_establecimiento'
  ];

  for (const tabla of tablas) {
    try {
      const result = await pool.query(`SELECT * FROM ${tabla}`);
      console.log(`\n📊 === ${tabla.toUpperCase()} (${result.rows.length} registros) ===`);
      if (result.rows.length > 0) {
        result.rows.forEach((row, i) => {
          console.log(`\nRegistro ${i + 1}:`, JSON.stringify(row, null, 2));
        });
      } else {
        console.log('Sin datos');
      }
    } catch (error) {
      console.log(`❌ Error en ${tabla}: ${error.message}`);
    }
  }

  await pool.end();
  console.log('\n✅ Consulta terminada');
}

consultarBD().catch(console.error); 