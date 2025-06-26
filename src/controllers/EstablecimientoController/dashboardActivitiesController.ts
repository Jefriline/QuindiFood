import { Request, Response } from 'express';
import DashboardService from '../../services/AdminService/dashboardService';

export const getDashboardActivities = async (req: Request, res: Response) => {
    try {
        const activities = await DashboardService.getDashboardActivities();
        res.json(activities);
    } catch (error) {
        console.error('Error en getDashboardActivities:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
};

// NUEVA FUNCIONALIDAD: Control de Establecimientos
export const getControlEstablecimientos = async (req: Request, res: Response) => {
    try {
        const control = await DashboardService.getControlEstablecimientos();
        res.json(control);
    } catch (error) {
        console.error('Error en getControlEstablecimientos:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
};
