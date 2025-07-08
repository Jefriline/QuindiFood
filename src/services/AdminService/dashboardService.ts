import DashboardRepository from '../../repositories/AdminRepository/dashboardRepository';

class DashboardService {
    static async getDashboardStats() {
        try {
            const stats = await DashboardRepository.getDashboardStats();
            return stats;
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
