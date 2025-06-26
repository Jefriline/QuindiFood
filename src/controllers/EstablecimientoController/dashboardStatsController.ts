import { Request, Response } from 'express';
import DashboardService from '../../services/AdminService/dashboardService';

const getDashboardStats = async (req: Request, res: Response) => {
    try {
        const stats = await DashboardService.getAllStats();

        return res.status(200).json({
            success: true,
            message: 'Estadísticas obtenidas exitosamente',
            data: stats
        });

    } catch (error: any) {
        console.error('Error al obtener estadísticas del dashboard:', error);
        return res.status(500).json({
            success: false,
            message: 'Error al obtener estadísticas',
            error: error?.message || 'Error desconocido'
        });
    }
};

export default getDashboardStats; 