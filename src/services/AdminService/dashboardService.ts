import DashboardRepository from '../../repositories/AdminRepository/dashboardRepository';

class DashboardService {
    static async getAllStats() {
        try {
            // Obtener todas las estadísticas en paralelo
            const [establecimientos, comentarios, usuarios, categorias] = await Promise.all([
                DashboardRepository.getEstablecimientosStats(),
                DashboardRepository.getComentariosStats(),
                DashboardRepository.getUsuariosStats(),
                DashboardRepository.getCategoriasStats()
            ]);

            return {
                establecimientos: {
                    total: parseInt(establecimientos.total) || 0,
                    activos: parseInt(establecimientos.activos) || 0,
                    suspendidos: parseInt(establecimientos.suspendidos) || 0,
                    pendientes: parseInt(establecimientos.pendientes) || 0,
                    nuevos: parseInt(establecimientos.nuevos) || 0
                },
                comentarios: {
                    total: parseInt(comentarios.total) || 0,
                    aprobados: parseInt(comentarios.total) || 0, // Todos están aprobados por default
                    pendientes: 0,
                    rechazados: 0,
                    reportados: parseInt(comentarios.reportados) || 0
                },
                usuarios: {
                    total: parseInt(usuarios.total) || 0,
                    activos: parseInt(usuarios.activos) || 0,
                    inactivos: parseInt(usuarios.inactivos) || 0,
                    nuevos: parseInt(usuarios.nuevos) || 0
                },
                categorias: {
                    total: (parseInt(categorias.total_estab) || 0) + (parseInt(categorias.total_prod) || 0),
                    activas: (parseInt(categorias.total_estab) || 0) + (parseInt(categorias.total_prod) || 0),
                    inactivas: 0,
                    nuevas: 0
                }
            };
        } catch (error) {
            console.error('Error en el servicio al obtener estadísticas:', error);
            throw error;
        }
    }

    static async getActividadesRecientes() {
        try {
            const actividades = await DashboardRepository.getActividadesRecientes();
            
            // Formatear las actividades para el frontend
            return actividades.map(activity => ({
                id: Math.random().toString(36).substr(2, 9), // ID temporal
                action: activity.action,
                name: activity.name,
                time: this.formatTimeAgo(activity.time),
                type: activity.type
            }));
        } catch (error) {
            console.error('Error en el servicio al obtener actividades recientes:', error);
            throw error;
        }
    }

    // Función auxiliar para formatear tiempo relativo
    private static formatTimeAgo(date: Date): string {
        const now = new Date();
        const diffInMilliseconds = now.getTime() - new Date(date).getTime();
        const diffInMinutes = Math.floor(diffInMilliseconds / (1000 * 60));
        const diffInHours = Math.floor(diffInMinutes / 60);
        const diffInDays = Math.floor(diffInHours / 24);

        if (diffInMinutes < 1) {
            return 'Hace un momento';
        } else if (diffInMinutes < 60) {
            return `Hace ${diffInMinutes} minuto${diffInMinutes !== 1 ? 's' : ''}`;
        } else if (diffInHours < 24) {
            return `Hace ${diffInHours} hora${diffInHours !== 1 ? 's' : ''}`;
        } else if (diffInDays < 7) {
            return `Hace ${diffInDays} día${diffInDays !== 1 ? 's' : ''}`;
        } else {
            return new Date(date).toLocaleDateString('es-CO');
        }
    }
}

export default DashboardService;
