import { ActividadRepository } from '../../repositories/ActividadRepository/actividadRepository';

export class ActividadService {
  // Registrar actividad de vista de perfil
  static async registrarVistaPerfil(idEstablecimiento: number, idUsuario?: number) {
    try {
      return await ActividadRepository.registrarActividad({
        idEstablecimiento,
        idUsuario,
        tipoActividad: 'vista_perfil'
      });
    } catch (error) {
      console.error('Error en registrarVistaPerfil:', error);
      throw error;
    }
  }

  // Registrar actividad de clic en contacto
  static async registrarClicContacto(idEstablecimiento: number, tipoContacto: string, idUsuario?: number) {
    try {
      return await ActividadRepository.registrarActividad({
        idEstablecimiento,
        idUsuario,
        tipoActividad: 'clic_contacto',
        datosAdicionales: { tipoContacto }
      });
    } catch (error) {
      console.error('Error en registrarClicContacto:', error);
      throw error;
    }
  }

  // Registrar nuevo comentario
  static async registrarNuevoComentario(idEstablecimiento: number, idUsuario: number) {
    try {
      return await ActividadRepository.registrarActividad({
        idEstablecimiento,
        idUsuario,
        tipoActividad: 'nuevo_comentario'
      });
    } catch (error) {
      console.error('Error en registrarNuevoComentario:', error);
      throw error;
    }
  }

  // Obtener estadísticas completas
  static async obtenerEstadisticasCompletas(idEstablecimiento: number, fechaInicio?: string, fechaFin?: string) {
    try {
      const [estadisticas, totalComentarios] = await Promise.all([
        ActividadRepository.obtenerEstadisticas(idEstablecimiento, fechaInicio, fechaFin),
        ActividadRepository.obtenerTotalComentarios(idEstablecimiento)
      ]);

      // Procesar datos para gráficos
      const resumenTipos = this.procesarResumenTipos(estadisticas.resumen);
      const datosBarras = this.procesarDatosBarras(estadisticas.actividadPorDias);

      return {
        resumen: resumenTipos,
        actividadPorDias: datosBarras,
        totalComentarios,
        estadisticas: estadisticas
      };
    } catch (error) {
      console.error('Error en obtenerEstadisticasCompletas:', error);
      throw error;
    }
  }

  // Obtener datos para exportar
  static async obtenerDatosExportar(idEstablecimiento: number, fechaInicio?: string, fechaFin?: string) {
    try {
      return await ActividadRepository.obtenerActividadesDetalladas(idEstablecimiento, fechaInicio, fechaFin);
    } catch (error) {
      console.error('Error en obtenerDatosExportar:', error);
      throw error;
    }
  }

  // Procesar datos para gráfico circular
  private static procesarResumenTipos(resumen: any[]) {
    const tiposNombres = {
      'vista_perfil': 'Visitas al Perfil',
      'clic_contacto': 'Clics en Contacto',
      'nuevo_comentario': 'Nuevos Comentarios'
    };

    const colores = {
      'vista_perfil': '#3B82F6',
      'clic_contacto': '#10B981',
      'nuevo_comentario': '#F59E0B'
    };

    return resumen.map(item => ({
      tipo: tiposNombres[item.tipo_actividad as keyof typeof tiposNombres] || item.tipo_actividad,
      cantidad: parseInt(item.total),
      color: colores[item.tipo_actividad as keyof typeof colores] || '#6B7280'
    }));
  }

  // Procesar datos para gráfico de barras
  private static procesarDatosBarras(actividadPorDias: any[]) {
    return actividadPorDias.map(dia => ({
      fecha: new Date(dia.fecha).toLocaleDateString('es-ES', { 
        month: 'short', 
        day: 'numeric' 
      }),
      fechaCompleta: dia.fecha,
      vistas_perfil: parseInt(dia.vistas_perfil) || 0,
      clics_contacto: parseInt(dia.clics_contacto) || 0,
      nuevos_comentarios: parseInt(dia.nuevos_comentarios) || 0,
      total: parseInt(dia.total_actividades) || 0
    }));
  }
} 