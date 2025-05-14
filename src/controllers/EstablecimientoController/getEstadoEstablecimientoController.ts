import { Request, Response } from 'express';
import ListEstablecimientoService from '../../services/EstablecimientoService/listEstablecimientoService';

const getEstadoEstablecimiento = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const estado = await ListEstablecimientoService.getEstadoEstablecimiento(Number(id));
    if (estado === null) {
      return res.status(404).json({ message: 'No se encontró el establecimiento.' });
    }
    res.json({ abierto: estado });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Error interno del servidor.' });
  }
};

export default getEstadoEstablecimiento; 