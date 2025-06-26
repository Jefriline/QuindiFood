import { Request, Response } from 'express';
import DashboardService from '../../services/AdminService/dashboardService';

export const getDashboardStats = async (req: Request, res: Response) => {
    try {
        const stats = await DashboardService.getDashboardStats();
        res.json(stats);
    } catch (error) {
        console.error('Error en getDashboardStats:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
}; 