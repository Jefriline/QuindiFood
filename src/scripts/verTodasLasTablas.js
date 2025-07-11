const { Pool } = require('pg');
require('dotenv').config();

// Configuración de PostgreSQL
const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USERNAME,
  port: parseInt(process.env.DB_PORT || '5432'),
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
};

// Función para formatear y mostrar resultados
function mostrarTabla(nombreTabla, resultados) {
  console.log('\n' + '='.repeat(80));
  console.log(`📊 TABLA: ${nombreTabla.toUpperCase()}`);
  console.log('='.repeat(80));
  
  if (resultados.length === 0) {
    console.log('❌ Sin datos');
    return;
  }
  
  console.log(`✅ Total de registros: ${resultados.length}`);
  console.log('-'.repeat(80));
  
  // Mostrar cada registro
  resultados.forEach((registro, index) => {
    console.log(`\n📝 Registro #${index + 1}:`);
    Object.entries(registro).forEach(([campo, valor]) => {
      const valorFormateado = valor === null ? 'NULL' : 
                             typeof valor === 'string' && valor.length > 100 ? 
                             valor.substring(0, 100) + '...' : valor;
      console.log(`   ${campo}: ${valorFormateado}`);
    });
  });
}

// Función principal
async function verTodasLasTablas() {
  let pool;
  
  try {
    console.log('🔌 Conectando a PostgreSQL...');
    pool = new Pool(dbConfig);
    
    // Probar conexión
    await pool.query('SELECT NOW()');
    console.log('✅ Conexión exitosa!');
    
    // Consultas organizadas por categoría
    const consultas = [
      // === USUARIOS ===
      { nombre: 'usuario_general', query: 'SELECT * FROM usuario_general' },
      { nombre: 'cliente', query: 'SELECT * FROM cliente' },
      { nombre: 'propietario_establecimiento', query: 'SELECT * FROM propietario_establecimiento' },
      { nombre: 'administrador_sistema', query: 'SELECT * FROM administrador_sistema' },
      
      // === CATEGORÍAS ===
      { nombre: 'categoria_establecimiento', query: 'SELECT * FROM categoria_establecimiento' },
      { nombre: 'categoria_producto', query: 'SELECT * FROM categoria_producto' },
      
      // === ESTABLECIMIENTOS ===
      { nombre: 'establecimiento', query: 'SELECT * FROM establecimiento' },
      { nombre: 'documentacion_establecimiento', query: 'SELECT * FROM documentacion_establecimiento' },
      { nombre: 'estado_membresia', query: 'SELECT * FROM estado_membresia' },
      { nombre: 'multimedia_establecimiento', query: 'SELECT * FROM multimedia_establecimiento' },
      
      // === PRODUCTOS Y PROMOCIONES ===
      { nombre: 'producto', query: 'SELECT * FROM producto' },
      { nombre: 'multimedia_producto', query: 'SELECT * FROM multimedia_producto' },
      { nombre: 'promocion', query: 'SELECT * FROM promocion' },
      
      // === INTERACCIONES ===
      { nombre: 'puntuacion', query: 'SELECT * FROM puntuacion' },
      { nombre: 'favorito', query: 'SELECT * FROM favorito' },
      { nombre: 'comentario', query: 'SELECT * FROM comentario' },
      
      // === EVENTOS ===
      { nombre: 'evento', query: 'SELECT * FROM evento' },
      { nombre: 'gestiona', query: 'SELECT * FROM gestiona' },
      { nombre: 'participacion_evento', query: 'SELECT * FROM participacion_evento' },
      { nombre: 'patrocinador_evento', query: 'SELECT * FROM patrocinador_evento' },
      
      // === OTROS ===
      { nombre: 'interactua', query: 'SELECT * FROM interactua' },
      { nombre: 'horario_establecimiento', query: 'SELECT * FROM horario_establecimiento' },
      { nombre: 'password_reset_codes', query: 'SELECT * FROM password_reset_codes' },
      { nombre: 'actividad_establecimiento', query: 'SELECT * FROM actividad_establecimiento' }
    ];
    
    console.log('\n🚀 Iniciando consulta de todas las tablas...\n');
    
    // Ejecutar todas las consultas
    for (const consulta of consultas) {
      try {
        console.log(`\n🔍 Consultando tabla: ${consulta.nombre}...`);
        const result = await pool.query(consulta.query);
        mostrarTabla(consulta.nombre, result.rows);
        
        // Pequeña pausa para que sea más legible
        await new Promise(resolve => setTimeout(resolve, 500));
        
      } catch (error) {
        console.log(`\n❌ Error en tabla ${consulta.nombre}:`);
        console.log(`   ${error.message}`);
      }
    }
    
    console.log('\n' + '='.repeat(80));
    console.log('🎉 CONSULTA COMPLETADA');
    console.log('='.repeat(80));
    console.log('✅ Todas las tablas han sido consultadas');
    console.log('📊 Revisa los datos arriba para análisis de la IA');
    console.log('🤖 Usa esta información para mejorar las respuestas');
    
  } catch (error) {
    console.error('💥 Error general:', error.message);
  } finally {
    if (pool) {
      await pool.end();
      console.log('\n🔌 Pool de conexiones cerrado');
    }
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  verTodasLasTablas()
    .then(() => {
      console.log('\n🏁 Script terminado exitosamente');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💀 Error fatal:', error);
      process.exit(1);
    });
}

module.exports = { verTodasLasTablas }; 