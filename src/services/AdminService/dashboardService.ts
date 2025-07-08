import DashboardRepository from '../../repositories/AdminRepository/dashboardRepository';

class DashboardService {
    static async getDashboardStats() {
        try {
            // Ejecutar todas las consultas en paralelo para máxima velocidad
            const [establecimientos, comentarios, usuarios, categorias, visitas_establecimientos] = await Promise.all([
                DashboardRepository.getEstablecimientosStats(),
                DashboardRepository.getComentariosStats(),
                DashboardRepository.getUsuariosStats(),
                DashboardRepository.getCategoriasStats(),
                DashboardRepository.getTotalVisitasEstablecimientos()
            ]);

            return {
                success: true,
                data: {
                    establecimientos: {
                        total: parseInt(establecimientos.total) || 0,
                        activos: parseInt(establecimientos.activos) || 0,
                        suspendidos: parseInt(establecimientos.suspendidos) || 0,
                        pendientes: parseInt(establecimientos.pendientes) || 0,
                        nuevos: parseInt(establecimientos.nuevos) || 0
                    },
                    comentarios: {
                        total: parseInt(comentarios.total) || 0,
                        reportados: parseInt(comentarios.reportados) || 0
                    },
                    usuarios: {
                        total: parseInt(usuarios.total) || 0,
                        activos: parseInt(usuarios.activos) || 0,
                        inactivos: parseInt(usuarios.inactivos) || 0,
                        nuevos: parseInt(usuarios.nuevos) || 0
                    },
                    categorias: {
                        establecimiento: parseInt(categorias.total_estab) || 0,
                        producto: parseInt(categorias.total_prod) || 0
                    },
                    visitas_establecimientos: visitas_establecimientos || 0
                }
            };
        } catch (error) {
            console.error('Error en DashboardService.getDashboardStats:', error);
            return {
                success: false,
                message: 'Error al obtener estadísticas del dashboard'
            };
        }
    }

    static async getDashboardActivities() {
        try {
            const actividades = await DashboardRepository.getActividadesRecientes();
            
            const formatteActivities = actividades.map(actividad => ({
                action: actividad.activity_detail || 'Actividad',
                name: actividad.activity_name || 'Sin nombre',
                time: actividad.activity_time || new Date(),
                type: actividad.activity_type || 'sistema'
            }));

            return {
                success: true,
                data: formatteActivities
            };
        } catch (error) {
            console.error('Error en DashboardService.getDashboardActivities:', error);
            // Retornar actividades mock para que no se rompa
            return {
                success: true,
                data: [
                    {
                        action: 'Sistema iniciado',
                        name: 'Panel de administración',
                        time: new Date(),
                        type: 'sistema'
                    }
                ]
            };
        }
    }

    // NUEVA FUNCIONALIDAD: Control de Establecimientos
    static async getControlEstablecimientos() {
        try {
            const [pendientes, recientes] = await Promise.all([
                DashboardRepository.getEstablecimientosPendientes(),
                DashboardRepository.getEstablecimientosRecientes()
            ]);

            return {
                success: true,
                data: {
                    pendientes: pendientes.map(est => ({
                        id: est.id_establecimiento,
                        nombre: est.nombre_establecimiento,
                        categoria: est.categoria,
                        fecha: est.created_at,
                        estado: est.estado
                    })),
                    recientes: recientes.map(est => ({
                        id: est.id_establecimiento,
                        nombre: est.nombre_establecimiento,
                        categoria: est.categoria,
                        fecha: est.created_at,
                        estado: est.estado
                    }))
                }
            };
        } catch (error) {
            console.error('Error en DashboardService.getControlEstablecimientos:', error);
            return {
                success: false,
                message: 'Error al obtener control de establecimientos'
            };
        }
    }
}

export default DashboardService;
