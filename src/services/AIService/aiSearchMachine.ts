import { generateAIResponse } from '../../config/gemini-config';
import pool from '../../config/config-db';
import * as natural from 'natural';
import FuzzySearch from 'fuzzy-search';
import { quitarTildes } from '../../Helpers/Normalize/quitarTildes';

export interface SearchMachineResponse {
  respuesta: string;
  productos: any[];
  establecimientos: any[];
  analisis_semantico: {
    intencion_detectada: string;
    patron_busqueda: string;
    palabras_clave: string[];
    nivel_confianza: number;
  };
  estadisticas: {
    tiempo_busqueda_ms: number;
    productos_analizados: number;
    establecimientos_analizados: number;
    precision_busqueda: number;
  };
}

export class AISearchMachine {
  private productosCache: any[] = [];
  private establecimientosCache: any[] = [];
  private lastCacheUpdate: number = 0;
  private cacheExpiry: number = 1 * 60 * 1000; // 1 minuto (más dinámico)
  
  // Análisis semántico con tokenizador avanzado
  private tokenizer = new natural.WordTokenizer();
  private stemmer = natural.PorterStemmerEs; // Stemmer en español
  private tfidf = new natural.TfIdf();
  private sentiment = new natural.SentimentAnalyzer('Spanish', natural.PorterStemmerEs, 'afinn');

  constructor() {
    // ✅ SIEMPRE inicializar caché al crear la instancia
    console.log('🤖 AISearchMachine creado - inicializando caché inmediatamente...');
    this.initializeCache(); // Forzar inicialización inmediata
  }

  // Método principal de la máquina de búsqueda
  async searchMachine(
    prompt: string, 
    history: Array<{user: string, ia: string}> = []
  ): Promise<SearchMachineResponse> {
    const startTime = Date.now();
    
    try {
      // Actualizar caché si es necesario
      await this.updateCacheIfNeeded();
      
      // Análisis semántico profundo del prompt
      const analisisSemantico = await this.analizarSemanticaCompleta(prompt, history);
      
      // Búsqueda ultra-inteligente en caché
      const resultadosBusqueda = await this.busquedaUltraInteligente(analisisSemantico);
      
      // Generar respuesta con IA usando todo el contexto
      const respuestaIA = await this.generarRespuestaConContexto(
        prompt, 
        history, 
        resultadosBusqueda, 
        analisisSemantico
      );
      
      const endTime = Date.now();
      
      return {
        respuesta: respuestaIA,
        productos: resultadosBusqueda.productos.slice(0, 10),
        establecimientos: resultadosBusqueda.establecimientos.slice(0, 8),
        analisis_semantico: {
          intencion_detectada: analisisSemantico.intencion,
          patron_busqueda: analisisSemantico.patron,
          palabras_clave: analisisSemantico.palabrasClave,
          nivel_confianza: analisisSemantico.confianza
        },
        estadisticas: {
          tiempo_busqueda_ms: endTime - startTime,
          productos_analizados: this.productosCache.length,
          establecimientos_analizados: this.establecimientosCache.length,
          precision_busqueda: resultadosBusqueda.precision
        }
      };
      
    } catch (error) {
      console.error('Error en search machine:', error);
      return {
        respuesta: 'Lo siento, ocurrió un error en la búsqueda. ¿Podrías reformular tu consulta?',
        productos: [],
        establecimientos: [],
        analisis_semantico: {
          intencion_detectada: 'error',
          patron_busqueda: 'desconocido',
          palabras_clave: [],
          nivel_confianza: 0
        },
        estadisticas: {
          tiempo_busqueda_ms: Date.now() - startTime,
          productos_analizados: 0,
          establecimientos_analizados: 0,
          precision_busqueda: 0
        }
      };
    }
  }

  // Inicializar caché completo de la BD
  private async initializeCache(): Promise<void> {
    try {
      console.log('🔄 Inicializando caché de búsqueda...');
      
      // 🔍 DIAGNÓSTICO: Verificar conteos detallados
      const diagnosticoQuery = `
        SELECT 
          'Total productos en BD' as tipo,
          COUNT(*) as cantidad
        FROM producto
        UNION ALL
        SELECT 
          'Productos con establecimiento aprobado' as tipo,
          COUNT(*) as cantidad
        FROM producto p
        INNER JOIN establecimiento e ON p.FK_id_establecimiento = e.id_establecimiento
        WHERE e.estado = 'Aprobado'
        UNION ALL
        SELECT 
          'Productos con categorías válidas' as tipo,
          COUNT(*) as cantidad
        FROM producto p
        INNER JOIN establecimiento e ON p.FK_id_establecimiento = e.id_establecimiento
        INNER JOIN categoria_establecimiento ce ON e.FK_id_categoria_estab = ce.id_categoria_establecimiento
        INNER JOIN categoria_producto cp ON p.FK_id_categoria_producto = cp.id_categoria_producto
        WHERE e.estado = 'Aprobado'
      `;
      
      const diagnostico = await pool.query(diagnosticoQuery);
      console.log('🔬 DIAGNÓSTICO DE PRODUCTOS:');
      diagnostico.rows.forEach((row: any) => {
        console.log(`   ${row.tipo}: ${row.cantidad}`);
      });
      
      // 🔍 ENCONTRAR LOS PRODUCTOS FALTANTES
      const productosFaltantesQuery = `
        SELECT p.id_producto, p.nombre, e.estado as estado_establecimiento, 
               ce.nombre as categoria_estab, cp.nombre as categoria_prod
        FROM producto p
        LEFT JOIN establecimiento e ON p.FK_id_establecimiento = e.id_establecimiento
        LEFT JOIN categoria_establecimiento ce ON e.FK_id_categoria_estab = ce.id_categoria_establecimiento
        LEFT JOIN categoria_producto cp ON p.FK_id_categoria_producto = cp.id_categoria_producto
        WHERE e.estado IS NULL OR e.estado != 'Aprobado' 
           OR ce.id_categoria_establecimiento IS NULL 
           OR cp.id_categoria_producto IS NULL
        ORDER BY p.id_producto
      `;
      
      const productosFaltantes = await pool.query(productosFaltantesQuery);
      if (productosFaltantes.rows.length > 0) {
        console.log('🚨 PRODUCTOS EXCLUIDOS:');
        productosFaltantes.rows.forEach((p: any) => {
          console.log(`   ID ${p.id_producto}: ${p.nombre} - Estado establecimiento: ${p.estado_establecimiento} - Cat.Estab: ${p.categoria_estab} - Cat.Prod: ${p.categoria_prod}`);
        });
      }
      
      // Cargar TODOS los productos con información completa
      const queryProductos = `
        SELECT 
          p.id_producto,
          p.nombre,
          p.precio,
          p.descripcion,
          e.nombre_establecimiento,
          e.ubicacion,
          e.descripcion as descripcion_establecimiento,
          e.id_establecimiento,
          ce.nombre as categoria_establecimiento,
          cp.nombre as categoria_producto,
          (SELECT ref_multimedia FROM multimedia_producto mp2 
           WHERE mp2.FK_id_producto = p.id_producto AND mp2.tipo = 'foto' 
           LIMIT 1) as imagen_producto,
          AVG(pu.valor_puntuado) as calificacion_promedio,
          COUNT(DISTINCT pu.valor_puntuado) as total_calificaciones,
          STRING_AGG(DISTINCT c.cuerpo_comentario, ' | ') as comentarios_usuarios
        FROM producto p
        INNER JOIN establecimiento e ON p.FK_id_establecimiento = e.id_establecimiento
        INNER JOIN categoria_establecimiento ce ON e.FK_id_categoria_estab = ce.id_categoria_establecimiento
        INNER JOIN categoria_producto cp ON p.FK_id_categoria_producto = cp.id_categoria_producto
        LEFT JOIN puntuacion pu ON e.id_establecimiento = pu.FK_id_establecimiento
        LEFT JOIN comentario c ON e.id_establecimiento = c.FK_id_establecimiento
        WHERE e.estado = 'Aprobado'
        GROUP BY p.id_producto, p.nombre, p.precio, p.descripcion, 
                 e.nombre_establecimiento, e.ubicacion, e.descripcion, e.id_establecimiento,
                 ce.nombre, cp.nombre
      `;
      
      const resultProductos = await pool.query(queryProductos);
      console.log(`📊 Debug productos:`, {
        filas_retornadas: resultProductos.rows.length,
        primeros_3_ids: resultProductos.rows.slice(0, 3).map((p: any) => p.id_producto)
      });
      
      this.productosCache = resultProductos.rows.map((p: any) => ({
        ...p,
        // Crear texto de búsqueda completo para análisis semántico
        texto_busqueda_completo: `${p.nombre} ${p.descripcion || ''} ${p.categoria_producto} ${p.nombre_establecimiento} ${p.categoria_establecimiento} ${p.ubicacion} ${p.comentarios_usuarios || ''}`.toLowerCase(),
        palabras_clave: this.extraerPalabrasClave(p),
        score_relevancia: this.calcularScoreRelevancia(p)
      }));
      
      // Cargar TODOS los establecimientos
      const queryEstablecimientos = `
        SELECT 
          e.id_establecimiento,
          e.nombre_establecimiento,
          e.ubicacion,
          e.descripcion,
          e.telefono,
          e.contacto,
          ce.nombre as categoria,
          AVG(pu.valor_puntuado) as calificacion_promedio,
          COUNT(DISTINCT pu.valor_puntuado) as total_calificaciones,
          COUNT(DISTINCT p.id_producto) as total_productos,
          STRING_AGG(DISTINCT p.nombre, ' | ') as productos_disponibles,
          STRING_AGG(DISTINCT cp.nombre, ' | ') as categorias_productos,
          STRING_AGG(DISTINCT c.cuerpo_comentario, ' | ') as comentarios_usuarios
        FROM establecimiento e
        INNER JOIN categoria_establecimiento ce ON e.FK_id_categoria_estab = ce.id_categoria_establecimiento
        LEFT JOIN puntuacion pu ON e.id_establecimiento = pu.FK_id_establecimiento
        LEFT JOIN producto p ON e.id_establecimiento = p.FK_id_establecimiento
        LEFT JOIN categoria_producto cp ON p.FK_id_categoria_producto = cp.id_categoria_producto
        LEFT JOIN comentario c ON e.id_establecimiento = c.FK_id_establecimiento
        WHERE e.estado = 'Aprobado'
        GROUP BY e.id_establecimiento, e.nombre_establecimiento, e.ubicacion, e.descripcion, e.telefono, e.contacto, ce.nombre
      `;
      
      const resultEstablecimientos = await pool.query(queryEstablecimientos);
      console.log(`📊 Debug establecimientos:`, {
        filas_retornadas: resultEstablecimientos.rows.length,
        primeros_3_ids: resultEstablecimientos.rows.slice(0, 3).map((e: any) => e.id_establecimiento)
      });
      
      this.establecimientosCache = resultEstablecimientos.rows.map((e: any) => ({
        ...e,
        // Crear texto de búsqueda completo
        texto_busqueda_completo: `${e.nombre_establecimiento} ${e.descripcion || ''} ${e.categoria} ${e.ubicacion} ${e.productos_disponibles || ''} ${e.categorias_productos || ''} ${e.comentarios_usuarios || ''}`.toLowerCase(),
        palabras_clave: this.extraerPalabrasClaveEstablecimiento(e),
        score_relevancia: this.calcularScoreRelevanciaEstablecimiento(e)
      }));
      
      this.lastCacheUpdate = Date.now();
      console.log(`✅ Caché inicializado: ${this.productosCache.length} productos, ${this.establecimientosCache.length} establecimientos`);
      
    } catch (error) {
      console.error('Error inicializando caché:', error);
    }
  }

  // Actualizar caché si ha expirado
  private async updateCacheIfNeeded(): Promise<void> {
    if (Date.now() - this.lastCacheUpdate > this.cacheExpiry) {
      await this.initializeCache();
    }
  }

  // Método público para forzar actualización del caché
  public async forceRefreshCache(): Promise<void> {
    console.log('🔄 Forzando actualización del caché...');
    await this.initializeCache();
    console.log('✅ Caché actualizado forzosamente');
  }

  // Análisis semántico ultra-completo
  private async analizarSemanticaCompleta(prompt: string, history: any[]): Promise<any> {
    const promptLower = prompt.toLowerCase();
    
    // Tokenización avanzada
    const tokens = this.tokenizer.tokenize(promptLower) || [];
    const stems = tokens.map((token: string) => this.stemmer.stem(token));
    
    // Detección de intención usando patrones avanzados
    const patrones = {
      busqueda_producto: {
        regex: /(quiero|busco|necesito|antojo|me gusta|dame|recomien)/i,
        peso: 0.8
      },
      filtro_precio: {
        regex: /(barato|económico|caro|precio|cuesta|vale|\$|\d+)/i,
        peso: 0.7
      },
      filtro_calidad: {
        regex: /(bueno|malo|excelente|delicioso|rico|sabroso|calidad|reputación|calificación|estrella)/i,
        peso: 0.9
      },
      filtro_ubicacion: {
        regex: /(cerca|lejos|centro|armenia|calarcá|ubicación|dirección)/i,
        peso: 0.6
      },
      tipo_comida: {
        regex: /(pizza|hamburguesa|pollo|carne|pescado|vegetariano|vegano|comida|almuerzo|desayuno|cena|postre|bebida|café)/i,
        peso: 1.0
      }
    };
    
    // Calcular scores de intención
    const scores: { [key: string]: number } = {};
    for (const [key, patron] of Object.entries(patrones)) {
      const matches = prompt.match(patron.regex);
      scores[key] = matches ? patron.peso * matches.length : 0;
    }
    
    // Extraer palabras clave usando TF-IDF
    this.tfidf.addDocument(tokens);
    const palabrasClave: string[] = [];
    this.tfidf.listTerms(0).slice(0, 10).forEach((item: any) => {
      if (item.tfidf > 0.1) {
        palabrasClave.push(item.term);
      }
    });
    
    // Detectar sentimiento
    const sentimiento = this.sentiment.getSentiment(tokens);
    
    // Análisis contextual con historial
    let contextoHistorial = '';
    if (history.length > 0) {
      const ultimosMensajes = history.slice(-3);
      contextoHistorial = ultimosMensajes.map((h: any) => `${h.user} ${h.ia}`).join(' ').toLowerCase();
    }
    
    // Determinar intención principal
    const intencionPrincipal = Object.entries(scores).reduce((a, b) => scores[a[0]] > scores[b[0]] ? a : b)[0];
    
    // Calcular nivel de confianza
    const maxScore = Math.max(...Object.values(scores));
    const confianza = Math.min(maxScore, 1.0);
    
    return {
      intencion: intencionPrincipal,
      patron: this.determinarPatronBusqueda(scores),
      palabrasClave: [...palabrasClave, ...this.extraerEntidades(prompt)],
      scores,
      sentimiento,
      contextoHistorial,
      confianza,
      tokens,
      stems
    };
  }

  // Búsqueda ultra-inteligente con múltiples algoritmos
  private async busquedaUltraInteligente(analisis: any): Promise<any> {
    // 🔧 LIMPIAR RESULTADOS PREVIOS
    const resultados: {
      productos: any[];
      establecimientos: any[];
      precision: number;
    } = {
      productos: [],
      establecimientos: [],
      precision: 0
    };
    
    console.log(`🔍 Nueva búsqueda iniciada - palabras clave: ${analisis.palabrasClave.join(', ')}`);
    
    // 1. Búsqueda por palabras clave exactas
    const busquedaExacta = this.busquedaExacta(analisis.palabrasClave);
    
    // 2. Búsqueda fuzzy para errores de escritura
    const busquedaFuzzy = this.busquedaFuzzy(analisis.tokens);
    
    // 3. Búsqueda semántica por stems
    const busquedaSemantica = this.busquedaSemantica(analisis.stems);
    
    // 4. Búsqueda por patrones de intención
    const busquedaPatrones = this.busquedaPorPatrones(analisis);
    
    // 5. Combinar resultados con pesos
    const productosFinales = this.combinarResultados([
      { resultados: busquedaExacta.productos, peso: 1.0 },
      { resultados: busquedaFuzzy.productos, peso: 0.8 },
      { resultados: busquedaSemantica.productos, peso: 0.7 },
      { resultados: busquedaPatrones.productos, peso: 0.9 }
    ]);
    
    const establecimientosFinales = this.combinarResultados([
      { resultados: busquedaExacta.establecimientos, peso: 1.0 },
      { resultados: busquedaFuzzy.establecimientos, peso: 0.8 },
      { resultados: busquedaSemantica.establecimientos, peso: 0.7 },
      { resultados: busquedaPatrones.establecimientos, peso: 0.9 }
    ]);
    
    // 🔧 FILTRAR SOLO PRODUCTOS RELEVANTES PARA ESTA BÚSQUEDA
    console.log(`📊 Productos antes de filtro: ${productosFinales.length}`);
    
    // Aplicar filtros inteligentes basados en análisis
    resultados.productos = this.aplicarFiltrosInteligentes(productosFinales, analisis);
    resultados.establecimientos = this.aplicarFiltrosInteligentesEstablecimientos(establecimientosFinales, analisis);
    
    console.log(`📊 Productos después de filtro: ${resultados.productos.length}`);
    
    // Calcular precisión
    resultados.precision = this.calcularPrecision(resultados, analisis);
    
    return resultados;
  }

  // Búsqueda exacta optimizada
  private busquedaExacta(palabrasClave: string[]): any {
    const productos: any[] = [];
    const establecimientos: any[] = [];
    
    console.log(`🔍 Búsqueda exacta para palabras: ${palabrasClave.join(', ')}`);
    
    for (const producto of this.productosCache) {
      let score = 0;
      let palabrasEncontradas = 0;
      const textoCompleto = producto.texto_busqueda_completo;
      
      // 🔥 NUEVA LÓGICA: BUSCAR CADA PALABRA INDIVIDUAL
      for (const palabra of palabrasClave) {
        const palabraLower = palabra.toLowerCase().trim();
        
        // Saltar palabras muy cortas o comunes
        if (palabraLower.length <= 2 || ['con', 'de', 'la', 'el', 'en', 'un', 'una'].includes(palabraLower)) {
          continue;
        }
        
        // 🔧 NORMALIZAR TILDES para mejor búsqueda
        const palabraNormalizada = quitarTildes(palabraLower);
        
        let palabraEncontrada = false;
        
        // 🎯 BÚSQUEDA EN NOMBRE (máximo peso) - CON Y SIN TILDES
        const nombreNormalizado = quitarTildes(producto.nombre.toLowerCase());
        if (producto.nombre.toLowerCase().includes(palabraLower) || 
            nombreNormalizado.includes(palabraNormalizada)) {
          score += 4.0;
          palabraEncontrada = true;
          console.log(`  ✅ "${palabraLower}" encontrada en NOMBRE: ${producto.nombre}`);
        }
        
        // 🎯 BÚSQUEDA EN DESCRIPCIÓN (alto peso) - CON Y SIN TILDES
        if (producto.descripcion) {
          const descripcionNormalizada = quitarTildes(producto.descripcion.toLowerCase());
          if (producto.descripcion.toLowerCase().includes(palabraLower) ||
              descripcionNormalizada.includes(palabraNormalizada)) {
            score += 3.0;
            palabraEncontrada = true;
            console.log(`  ✅ "${palabraLower}" encontrada en DESCRIPCIÓN: ${producto.descripcion.substring(0, 50)}...`);
          }
        }
        
        // 🎯 BÚSQUEDA EN CATEGORÍA DE PRODUCTO - CON Y SIN TILDES
        if (producto.categoria_producto) {
          const categoriaNormalizada = quitarTildes(producto.categoria_producto.toLowerCase());
          if (producto.categoria_producto.toLowerCase().includes(palabraLower) ||
              categoriaNormalizada.includes(palabraNormalizada)) {
            score += 2.5;
            palabraEncontrada = true;
            console.log(`  ✅ "${palabraLower}" encontrada en CATEGORÍA: ${producto.categoria_producto}`);
          }
        }
        
        // 🎯 BÚSQUEDA EN NOMBRE DE ESTABLECIMIENTO - CON Y SIN TILDES
        if (producto.nombre_establecimiento) {
          const establecimientoNormalizado = quitarTildes(producto.nombre_establecimiento.toLowerCase());
          if (producto.nombre_establecimiento.toLowerCase().includes(palabraLower) ||
              establecimientoNormalizado.includes(palabraNormalizada)) {
            score += 2.0;
            palabraEncontrada = true;
            console.log(`  ✅ "${palabraLower}" encontrada en ESTABLECIMIENTO: ${producto.nombre_establecimiento}`);
          }
        }
        
        // 🎯 BÚSQUEDA EN TEXTO COMPLETO (peso bajo) - CON Y SIN TILDES
        if (!palabraEncontrada) {
          const textoNormalizado = quitarTildes(textoCompleto);
          if (textoCompleto.includes(palabraLower) || textoNormalizado.includes(palabraNormalizada)) {
            score += 1.0;
            palabraEncontrada = true;
            console.log(`  ✅ "${palabraLower}" encontrada en TEXTO COMPLETO`);
          }
        }
        
        if (palabraEncontrada) {
          palabrasEncontradas++;
        }
      }
      
      // 🎯 BONUS POR MÚLTIPLES PALABRAS ENCONTRADAS
      const porcentajePalabras = palabrasEncontradas / Math.max(palabrasClave.length - 2, 1); // Excluir palabras comunes
      if (porcentajePalabras >= 0.5) { // Si encuentra al menos 50% de palabras importantes
        score += (porcentajePalabras * 5.0); // Bonus por coincidencias múltiples
        console.log(`  🎯 BONUS múltiples palabras: ${porcentajePalabras.toFixed(2)} x 5.0 = +${(porcentajePalabras * 5.0).toFixed(1)}`);
      }
      
      // 🍪 BONUS ESPECÍFICOS PARA CASOS COMUNES
      const palabrasEspeciales = palabrasClave.filter((p: string) => 
        ['cookies', 'cream', 'galleta', 'chocolate', 'vainilla', 'trozos', 'té', 'te', 'japones', 'japonés'].includes(p.toLowerCase())
      );
      
      if (palabrasEspeciales.length > 0) {
        for (const palabraEsp of palabrasEspeciales) {
          const palabraEspNormalizada = quitarTildes(palabraEsp.toLowerCase());
          const nombreNormalizado = quitarTildes(producto.nombre.toLowerCase());
          const descripcionNormalizada = producto.descripcion ? quitarTildes(producto.descripcion.toLowerCase()) : '';
          
          if (producto.nombre.toLowerCase().includes(palabraEsp.toLowerCase()) || 
              nombreNormalizado.includes(palabraEspNormalizada) ||
              (producto.descripcion && producto.descripcion.toLowerCase().includes(palabraEsp.toLowerCase())) ||
              descripcionNormalizada.includes(palabraEspNormalizada)) {
            score += 3.0; // Bonus extra para palabras específicas
            console.log(`  🍪 BONUS palabra especial "${palabraEsp}": +3.0`);
          }
        }
      }
      
      // 🎯 BONUS EXTRA PARA COINCIDENCIAS PERFECTAS
      const busquedaCompleta = palabrasClave.join(' ').toLowerCase();
      const busquedaNormalizada = quitarTildes(busquedaCompleta);
      const nombreProductoNormalizado = quitarTildes(producto.nombre.toLowerCase());
      const descripcionProductoNormalizada = producto.descripcion ? quitarTildes(producto.descripcion.toLowerCase()) : '';
      
      // Si el nombre o descripción contiene múltiples palabras de la búsqueda
      if (nombreProductoNormalizado.includes(busquedaNormalizada) || 
          descripcionProductoNormalizada.includes(busquedaNormalizada)) {
        score += 10.0; // BONUS ENORME para coincidencias perfectas
        console.log(`  🎯 BONUS COINCIDENCIA PERFECTA: +10.0`);
      }
      
      if (score > 0) {
        productos.push({ 
          ...producto, 
          search_score: score,
          palabras_encontradas: palabrasEncontradas,
          total_palabras: palabrasClave.length
        });
        
        // 🔍 DEBUG detallado para productos con score alto
        if (score > 5.0) {
          console.log(`🔥 PRODUCTO CON SCORE ALTO: ID ${producto.id_producto} - ${producto.nombre} - Score: ${score.toFixed(2)}`);
          console.log(`   📝 Descripción: ${producto.descripcion || 'Sin descripción'}`);
          console.log(`   📊 Palabras: ${palabrasEncontradas}/${palabrasClave.length}`);
        }
      }
    }
    
    // Log de productos encontrados
    console.log(`📊 Búsqueda exacta encontró ${productos.length} productos`);
    
    // Procesar establecimientos (simplificado)
    for (const establecimiento of this.establecimientosCache) {
      let score = 0;
      for (const palabra of palabrasClave) {
        const palabraLower = palabra.toLowerCase();
        
        if (palabraLower.length <= 2) continue;
        
        if (establecimiento.nombre_establecimiento.toLowerCase().includes(palabraLower)) {
          score += 2.0;
        } else if (establecimiento.texto_busqueda_completo.includes(palabraLower)) {
          score += 1.0;
        }
      }
      if (score > 0) {
        establecimientos.push({ ...establecimiento, search_score: score });
      }
    }
    
    return { productos, establecimientos };
  }

  // Búsqueda fuzzy para errores de escritura
  private busquedaFuzzy(tokens: string[]): any {
    const productos: any[] = [];
    const establecimientos: any[] = [];
    
    // Crear búsquedas fuzzy para productos
    const fuzzyProductos = new FuzzySearch(this.productosCache, ['nombre', 'descripcion', 'categoria_producto', 'nombre_establecimiento'], {
      caseSensitive: false,
      sort: true
    });
    
    // Crear búsquedas fuzzy para establecimientos
    const fuzzyEstablecimientos = new FuzzySearch(this.establecimientosCache, ['nombre_establecimiento', 'descripcion', 'categoria'], {
      caseSensitive: false,
      sort: true
    });
    
    for (const token of tokens) {
      if (token.length > 2) { // Solo buscar tokens significativos
        const productosEncontrados = fuzzyProductos.search(token);
        const establecimientosEncontrados = fuzzyEstablecimientos.search(token);
        
        productos.push(...productosEncontrados.map((p: any) => ({ ...p, search_score: 0.8 })));
        establecimientos.push(...establecimientosEncontrados.map((e: any) => ({ ...e, search_score: 0.8 })));
      }
    }
    
    return { productos, establecimientos };
  }

  // Búsqueda semántica por stems
  private busquedaSemantica(stems: string[]): any {
    const productos: any[] = [];
    const establecimientos: any[] = [];
    
    for (const producto of this.productosCache) {
      let score = 0;
      for (const stem of stems) {
        if (producto.texto_busqueda_completo.includes(stem)) {
          score += 0.7;
        }
      }
      if (score > 0) {
        productos.push({ ...producto, search_score: score });
      }
    }
    
    for (const establecimiento of this.establecimientosCache) {
      let score = 0;
      for (const stem of stems) {
        if (establecimiento.texto_busqueda_completo.includes(stem)) {
          score += 0.7;
        }
      }
      if (score > 0) {
        establecimientos.push({ ...establecimiento, search_score: score });
      }
    }
    
    return { productos, establecimientos };
  }

  // Búsqueda por patrones de intención
  private busquedaPorPatrones(analisis: any): any {
    let productos = [...this.productosCache];
    let establecimientos = [...this.establecimientosCache];
    
    // Filtrar por calidad si se requiere
    if (analisis.scores.filtro_calidad > 0) {
      productos = productos.filter((p: any) => (p.calificacion_promedio && parseFloat(p.calificacion_promedio) >= 3.5) || p.score_relevancia > 0.7);
      establecimientos = establecimientos.filter((e: any) => (e.calificacion_promedio && parseFloat(e.calificacion_promedio) >= 3.5) || e.score_relevancia > 0.7);
    }
    
    // Ordenar por precio si se requiere
    if (analisis.scores.filtro_precio > 0) {
      if (analisis.tokens.some((t: string) => ['barato', 'económico', 'bajo'].includes(t))) {
        productos.sort((a: any, b: any) => parseFloat(a.precio) - parseFloat(b.precio));
      } else if (analisis.tokens.some((t: string) => ['caro', 'premium', 'alto'].includes(t))) {
        productos.sort((a: any, b: any) => parseFloat(b.precio) - parseFloat(a.precio));
      }
    }
    
    return {
      productos: productos.map((p: any) => ({ ...p, search_score: 0.6 })),
      establecimientos: establecimientos.map((e: any) => ({ ...e, search_score: 0.6 }))
    };
  }

  // Combinar resultados con pesos
  private combinarResultados(resultadosArray: any[]): any[] {
    const map = new Map();
    
    for (const { resultados, peso } of resultadosArray) {
      for (const item of resultados) {
        const key = item.id_producto || item.id_establecimiento;
        if (map.has(key)) {
          map.get(key).search_score += (item.search_score * peso);
          map.get(key).count += 1;
        } else {
          map.set(key, { ...item, search_score: item.search_score * peso, count: 1 });
        }
      }
    }
    
    return Array.from(map.values())
      .map((item: any) => ({ ...item, search_score: item.search_score / item.count }))
      .sort((a: any, b: any) => b.search_score - a.search_score);
  }

  // Aplicar filtros inteligentes a productos
  private aplicarFiltrosInteligentes(productos: any[], analisis: any): any[] {
    let filtered = productos;
    
    console.log(`🔍 DEBUG - Aplicando filtros inteligentes...`);
    console.log(`📊 Productos originales: ${productos.length}`);
    
    // 🔥 FILTRO MÁS ESTRICTO PARA BÚSQUEDAS ESPECÍFICAS
    const palabrasImportantes = analisis.palabrasClave.filter((p: string) => p.length > 2);
    
    // Si hay palabras específicas, filtrar productos que realmente las contengan
    if (palabrasImportantes.length > 0) {
      filtered = filtered.filter((p: any) => {
        let tieneCoincidencia = false;
        
        for (const palabra of palabrasImportantes) {
          const palabraLower = palabra.toLowerCase();
          
          // Verificar si el producto realmente contiene esta palabra
          if (p.nombre.toLowerCase().includes(palabraLower) ||
              (p.descripcion && p.descripcion.toLowerCase().includes(palabraLower)) ||
              p.categoria_producto.toLowerCase().includes(palabraLower) ||
              p.nombre_establecimiento.toLowerCase().includes(palabraLower)) {
            tieneCoincidencia = true;
            break;
          }
        }
        
        return tieneCoincidencia;
      });
      
      console.log(`📊 Después de filtro por palabras específicas: ${filtered.length}`);
    }
    
    // Filtro de relevancia mínima - más inclusivo para búsquedas específicas
    filtered = filtered.filter((p: any) => p.search_score >= 0.3);
    
    console.log(`📊 Después de filtro por score: ${filtered.length}`);
    
    // 🔍 DEBUG: Log de productos antes del filtro
    if (filtered.length > 0) {
      console.log(`📊 Productos filtrados encontrados:`);
      filtered.slice(0, 5).forEach((p: any) => {
        console.log(`   ID ${p.id_producto}: ${p.nombre} (score: ${p.search_score.toFixed(2)})`);
      });
    }
    
    // Buscar específicamente productos problemáticos (como helado en búsqueda de té)
    const productosNoRelacionados = filtered.filter((p: any) => {
      // Si buscan "té" pero aparece "helado", es problemático
      const buscaTe = palabrasImportantes.some((palabra: string) => 
        palabra.toLowerCase().includes('te') || palabra.toLowerCase().includes('japonés')
      );
      const esHelado = p.nombre.toLowerCase().includes('helado') || 
                      p.categoria_producto.toLowerCase().includes('helado');
      
      return buscaTe && esHelado;
    });
    
    if (productosNoRelacionados.length > 0) {
      console.log(`⚠️ PRODUCTOS NO RELACIONADOS DETECTADOS:`);
      productosNoRelacionados.forEach((p: any) => {
        console.log(`   ID ${p.id_producto}: ${p.nombre} - NO debe aparecer en esta búsqueda`);
      });
      
      // Remover productos no relacionados
      filtered = filtered.filter((p: any) => !productosNoRelacionados.includes(p));
    }
    
    // Filtro por ubicación inteligente
    if (analisis.scores.filtro_ubicacion > 0) {
      const ubicacionesDetectadas = analisis.tokens.filter((t: string) => 
        ['centro', 'armenia', 'calarcá', 'norte', 'sur'].includes(t)
      );
      
      if (ubicacionesDetectadas.length > 0) {
        filtered = filtered.filter((p: any) => 
          ubicacionesDetectadas.some((ub: string) => 
            p.ubicacion.toLowerCase().includes(ub)
          )
        );
      }
    }
    
    // Ordenar por relevancia y limitar a 10 resultados
    const resultado = filtered
      .sort((a: any, b: any) => b.search_score - a.search_score)
      .slice(0, 10);
    
    console.log(`✅ Productos finales: ${resultado.length}`);
    
    return resultado;
  }

  // Aplicar filtros inteligentes a establecimientos
  private aplicarFiltrosInteligentesEstablecimientos(establecimientos: any[], analisis: any): any[] {
    let filtered = establecimientos;
    
    // Filtro de relevancia mínima - más estricto
    filtered = filtered.filter((e: any) => e.search_score >= 0.8);
    
    // Filtro por ubicación inteligente
    if (analisis.scores.filtro_ubicacion > 0) {
      const ubicacionesDetectadas = analisis.tokens.filter((t: string) => 
        ['centro', 'armenia', 'calarcá', 'norte', 'sur'].includes(t)
      );
      
      if (ubicacionesDetectadas.length > 0) {
        filtered = filtered.filter((e: any) => 
          ubicacionesDetectadas.some((ub: string) => 
            e.ubicacion.toLowerCase().includes(ub)
          )
        );
      }
    }
    
    // Ordenar por relevancia y limitar a 3 establecimientos más relevantes
    return filtered
      .sort((a: any, b: any) => b.search_score - a.search_score)
      .slice(0, 3);
  }

  // Generar respuesta con IA usando todo el contexto
  private async generarRespuestaConContexto(
    prompt: string, 
    history: any[], 
    resultados: any, 
    analisis: any
  ): Promise<string> {
    // Importar la nueva función optimizada
    const { generateResponseWithRealData } = await import('../../config/gemini-config');
    
    // Usar la nueva función con datos reales
    return await generateResponseWithRealData(
      prompt,
      resultados.productos || [],
      resultados.establecimientos || [],
      {
        intencion_detectada: analisis.intencion,
        palabras_clave: analisis.palabrasClave,
        nivel_confianza: analisis.confianza
      },
      history
    );
  }

  // Utilidades de análisis
  private extraerPalabrasClave(producto: any): string[] {
    const texto = `${producto.nombre} ${producto.descripcion || ''} ${producto.categoria_producto}`;
    return this.tokenizer.tokenize(texto.toLowerCase()) || [];
  }

  private extraerPalabrasClaveEstablecimiento(establecimiento: any): string[] {
    const texto = `${establecimiento.nombre_establecimiento} ${establecimiento.descripcion || ''} ${establecimiento.categoria}`;
    return this.tokenizer.tokenize(texto.toLowerCase()) || [];
  }

  private extraerEntidades(prompt: string): string[] {
    const entidades: string[] = [];
    
    // Detectar nombres de comida
    const comidasConocidas = ['pizza', 'hamburguesa', 'pollo', 'carne', 'pescado', 'pasta', 'ensalada', 'sopa', 'postre', 'café'];
    for (const comida of comidasConocidas) {
      if (prompt.toLowerCase().includes(comida)) {
        entidades.push(comida);
      }
    }
    
    // Detectar ubicaciones
    const ubicaciones = ['armenia', 'centro', 'calarcá', 'norte', 'sur'];
    for (const ubicacion of ubicaciones) {
      if (prompt.toLowerCase().includes(ubicacion)) {
        entidades.push(ubicacion);
      }
    }
    
    return entidades;
  }

  private determinarPatronBusqueda(scores: { [key: string]: number }): string {
    const maxScore = Math.max(...Object.values(scores));
    if (maxScore === 0) return 'general';
    
    const patron = Object.entries(scores).find(([key, score]) => score === maxScore)?.[0];
    return patron || 'general';
  }

  private calcularScoreRelevancia(producto: any): number {
    let score = 0.5; // Base
    
    if (producto.calificacion_promedio) {
      score += parseFloat(producto.calificacion_promedio) * 0.1;
    }
    
    if (producto.total_calificaciones > 10) {
      score += 0.1;
    }
    
    if (producto.descripcion && producto.descripcion.length > 50) {
      score += 0.1;
    }
    
    return Math.min(score, 1.0);
  }

  private calcularScoreRelevanciaEstablecimiento(establecimiento: any): number {
    let score = 0.5; // Base
    
    if (establecimiento.calificacion_promedio) {
      score += parseFloat(establecimiento.calificacion_promedio) * 0.1;
    }
    
    if (establecimiento.total_productos > 5) {
      score += 0.1;
    }
    
    if (establecimiento.total_calificaciones > 20) {
      score += 0.1;
    }
    
    return Math.min(score, 1.0);
  }

  private calcularPrecision(resultados: any, analisis: any): number {
    const totalResultados = resultados.productos.length + resultados.establecimientos.length;
    if (totalResultados === 0) return 0;
    
    // Calcular precisión basada en scores de búsqueda y confianza del análisis
    const avgScore = (
      resultados.productos.reduce((sum: number, p: any) => sum + (p.search_score || 0), 0) +
      resultados.establecimientos.reduce((sum: number, e: any) => sum + (e.search_score || 0), 0)
    ) / totalResultados;
    
    return Math.min(avgScore * analisis.confianza, 1.0);
  }
}