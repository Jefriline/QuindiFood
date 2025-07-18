import EstadisticasRepository from '../../repositories/EstadisticasRepository/estadisticasRepository';
import { 
    DashboardEstadisticasDto,
    EstadisticasGeneralesDto,
    GraficaBarrasDto,
    GraficoCircularDto,
    ActividadDiariaDto,
    ExportarEstadisticasDto,
    FiltrosEstadisticasDto
} from '../../Dto/EstadisticasDto/estadisticasDto';

class EstadisticasService {

    // Obtener dashboard completo de estadísticas
    static async getDashboardEstadisticas(
        usuarioId: number,
        filtros?: FiltrosEstadisticasDto
    ): Promise<{ success: boolean; data?: DashboardEstadisticasDto; message?: string }> {
        try {
            // Primero verificar que el usuario tenga un establecimiento
            const establecimientoInfo = await this.getEstablecimientoUsuario(usuarioId);
            if (!establecimientoInfo) {
                return {
                    success: false,
                    message: 'No tienes un establecimiento registrado'
                };
            }

            // Calcular fechas del período
            const { fechaInicio, fechaFin } = this.calcularPeriodo(filtros);

            // Obtener todas las estadísticas en paralelo
            const [
                estadisticasGenerales,
                totalesPorTipo,
                tendencias
            ] = await Promise.all([
                EstadisticasRepository.getEstadisticasGenerales(
                    establecimientoInfo.id
                ),
                EstadisticasRepository.getTotalesPorTipoActividad(
                    establecimientoInfo.id,
                    fechaInicio,
                    fechaFin
                ),
                EstadisticasRepository.getTendencias(establecimientoInfo.id)
            ]);

            // Generar gráfico circular solo con clics, comentarios y favoritos
            const graficoInteracciones = this.generarGraficoCircular(totalesPorTipo);

            // Devolver los campos requeridos por el DTO, pero solo con datos útiles
            const dashboard: DashboardEstadisticasDto = {
                estadisticas_generales: estadisticasGenerales,
                grafica_actividad: { labels: [], datasets: [{ label: '', data: [], backgroundColor: '', borderColor: '', borderWidth: 0 }] }, // vacío
                grafico_interacciones: graficoInteracciones,
                actividad_reciente: [], // vacío
                tendencias
            };

            return {
                success: true,
                data: dashboard
            };

        } catch (error) {
            console.error('❌ Error obteniendo dashboard:', error);
            return {
                success: false,
                message: 'Error al obtener las estadísticas del dashboard'
            };
        }
    }

    // Exportar estadísticas en formato JSON
    static async exportarEstadisticas(
        usuarioId: number,
        filtros?: FiltrosEstadisticasDto
    ): Promise<{ success: boolean; data?: ExportarEstadisticasDto; message?: string }> {
        try {
            const establecimientoInfo = await this.getEstablecimientoUsuario(usuarioId);
            if (!establecimientoInfo) {
                return {
                    success: false,
                    message: 'No tienes un establecimiento registrado'
                };
            }

            const { fechaInicio, fechaFin } = this.calcularPeriodo(filtros);

            const [estadisticasGenerales, actividadDiaria] = await Promise.all([
                EstadisticasRepository.getEstadisticasGenerales(
                    establecimientoInfo.id,
                    fechaInicio,
                    fechaFin
                ),
                EstadisticasRepository.getActividadDiaria(
                    establecimientoInfo.id,
                    fechaInicio,
                    fechaFin
                )
            ]);

            const exportData: ExportarEstadisticasDto = {
                establecimiento: establecimientoInfo,
                periodo: {
                    inicio: fechaInicio,
                    fin: fechaFin,
                    tipo: filtros?.tipo_periodo || 'mes'
                },
                resumen: estadisticasGenerales,
                actividad_diaria: actividadDiaria,
                fecha_generacion: new Date().toISOString()
            };

            return {
                success: true,
                data: exportData
            };

        } catch (error) {
            console.error('❌ Error exportando estadísticas:', error);
            return {
                success: false,
                message: 'Error al exportar las estadísticas'
            };
        }
    }

    // Generar gráfica de barras para actividad
    private static generarGraficaBarras(actividadDiaria: ActividadDiariaDto[]): GraficaBarrasDto {
        const labels = actividadDiaria.map(dia => {
            const fecha = new Date(dia.fecha);
            return fecha.toLocaleDateString('es-ES', { 
                month: 'short', 
                day: 'numeric' 
            });
        });

        const data = actividadDiaria.map(dia => dia.total);

        return {
            labels,
            datasets: [{
                label: 'Actividad Total',
                data,
                backgroundColor: 'rgba(255, 107, 107, 0.6)',
                borderColor: 'rgba(255, 107, 107, 1)',
                borderWidth: 2
            }]
        };
    }

    // Generar gráfico circular para tipos de interacción
    private static generarGraficoCircular(
        totalesPorTipo: { tipo: string; total: number }[]
    ): GraficoCircularDto {
        const colores = [
            'rgba(255, 107, 107, 0.8)',  // Rojo
            'rgba(54, 162, 235, 0.8)',   // Azul
            'rgba(40, 167, 69, 0.8)'     // Verde
        ];
        const bordColores = [
            'rgba(255, 107, 107, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(40, 167, 69, 1)'
        ];
        let clics = 0, comentarios = 0, favoritos = 0;
        totalesPorTipo.forEach(item => {
            if (item.tipo === 'clic_perfil' || item.tipo === 'click_establecimiento') clics += item.total;
            if (item.tipo === 'comentario') comentarios += item.total;
            if (item.tipo === 'favorito') favoritos += item.total;
        });
        return {
            labels: ['Clics', 'Comentarios', 'Favoritos'],
            datasets: [{
                data: [clics, comentarios, favoritos],
                backgroundColor: colores,
                borderColor: bordColores,
                borderWidth: 2
            }]
        };
    }

    // Calcular período de fechas basado en filtros
    private static calcularPeriodo(filtros?: FiltrosEstadisticasDto): {
        fechaInicio: string;
        fechaFin: string;
    } {
        const ahora = new Date();
        let fechaInicio: Date;
        
        if (filtros?.fecha_inicio && filtros?.fecha_fin) {
            return {
                fechaInicio: filtros.fecha_inicio,
                fechaFin: filtros.fecha_fin
            };
        }

        // Calcular basado en tipo_periodo
        switch (filtros?.tipo_periodo) {
            case 'dia':
                fechaInicio = new Date(ahora);
                fechaInicio.setDate(ahora.getDate() - 1);
                break;
            case 'semana':
                fechaInicio = new Date(ahora);
                fechaInicio.setDate(ahora.getDate() - 7);
                break;
            case 'trimestre':
                fechaInicio = new Date(ahora);
                fechaInicio.setMonth(ahora.getMonth() - 3);
                break;
            case 'año':
                fechaInicio = new Date(ahora);
                fechaInicio.setFullYear(ahora.getFullYear() - 1);
                break;
            default: // 'mes'
                fechaInicio = new Date(ahora);
                fechaInicio.setMonth(ahora.getMonth() - 1);
        }

        return {
            fechaInicio: fechaInicio.toISOString().split('T')[0],
            fechaFin: ahora.toISOString().split('T')[0]
        };
    }

    // Obtener establecimiento del usuario
    private static async getEstablecimientoUsuario(usuarioId: number): Promise<{
        id: number;
        nombre: string;
        categoria: string;
    } | null> {
        try {
            return await EstadisticasRepository.getEstablecimientoPorUsuario(usuarioId);
        } catch (error) {
            console.error('❌ Error obteniendo establecimiento del usuario:', error);
            return null;
        }
    }

    // Obtener actividad reciente (feed para dashboard)
    static async getActividadReciente(usuarioId: number): Promise<any[]> {
        const establecimientoInfo = await this.getEstablecimientoUsuario(usuarioId);
        if (!establecimientoInfo) return [];
        const eventos = await EstadisticasRepository.getActividadReciente(establecimientoInfo.id);
        return eventos.map(ev => {
            let descripcion = '';
            switch (ev.tipo_actividad) {
                case 'click_establecimiento':
                case 'clic_perfil':
                    descripcion = 'Nuevo clic en el perfil';
                    break;
                case 'favorito':
                    descripcion = 'Nuevo favorito agregado';
                    break;
                case 'comentario':
                    descripcion = 'Nuevo comentario recibido';
                    break;
                case 'puntuacion':
                    descripcion = 'Nueva puntuación recibida';
                    break;
                default:
                    descripcion = ev.tipo_actividad;
            }
            return {
                tipo: ev.tipo_actividad,
                usuario: ev.fk_id_usuario,
                fecha: ev.fecha_actividad,
                descripcion,
                datos: ev.datos_adicionales
            };
        });
    }
}

export default EstadisticasService; 