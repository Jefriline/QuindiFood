import { Request, Response } from 'express';
import EstablecimientoService from '../../services/EstablecimientoService/establecimientoService';

const eliminarEstablecimientoAdmin = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        if (!id || isNaN(parseInt(id))) {
            return res.status(400).json({ success: false, message: 'ID inválido' });
        }
        const resultado = await EstablecimientoService.eliminarEstablecimientoCompleto(parseInt(id), undefined, true);
        return res.status(200).json({ success: true, message: 'Establecimiento eliminado', data: resultado });
    } catch (error: any) {
        return res.status(500).json({ success: false, message: error.message });
    }
};
export default eliminarEstablecimientoAdmin; 