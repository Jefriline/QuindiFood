import { Request, Response } from 'express';
import EstablecimientoService from '../../services/EstablecimientoService/establecimientoService';

const eliminarEstablecimientoPropietario = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const idUsuario = (req as any).user?.id;
        if (!id || isNaN(parseInt(id))) {
            return res.status(400).json({ success: false, message: 'ID inválido' });
        }
        if (!idUsuario) {
            return res.status(401).json({ success: false, message: 'No autenticado' });
        }
        const resultado = await EstablecimientoService.eliminarEstablecimientoCompleto(parseInt(id), idUsuario, false);
        return res.status(200).json({ success: true, message: 'Establecimiento eliminado', data: resultado });
    } catch (error: any) {
        return res.status(500).json({ success: false, message: error.message });
    }
};
export default eliminarEstablecimientoPropietario; 