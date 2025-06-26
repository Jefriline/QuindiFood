import { Request, Response } from 'express';
import DashboardService from '../../services/AdminService/dashboardService';

const getDashboardActivities = async (req: Request, res: Response) => {
    try {
        const activities = await DashboardService.getActividadesRecientes();

        return res.status(200).json({
            success: true,
            message: 'Actividades recientes obtenidas exitosamente',
            data: activities
        });

    } catch (error: any) {
        console.error('Error al obtener actividades recientes:', error);
        return res.status(500).json({
            success: false,
            message: 'Error al obtener actividades recientes',
            error: error?.message || 'Error desconocido'
        });
    }
};

export default getDashboardActivities;
