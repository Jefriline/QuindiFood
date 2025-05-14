import { Request, Response } from 'express';
import ListEstablecimientoService from '../../services/EstablecimientoService/listEstablecimientoService';

const getEstablecimientoById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const establecimiento = await ListEstablecimientoService.getEstablecimientoById(Number(id));
    if (!establecimiento) {
      return res.status(404).json({ message: 'No se encontró el establecimiento.' });
    }
    res.json(establecimiento);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Error interno del servidor.' });
  }
};

export default getEstablecimientoById; 