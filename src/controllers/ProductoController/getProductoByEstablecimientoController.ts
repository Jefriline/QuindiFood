import { Request, Response } from 'express';
import listProductoService from '../../services/ProductoService/listProductoService';

const getProductosByIdEstablecimiento = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const productos = await listProductoService.getProductoByIdEstablecimiento(Number(id));
    if (!productos) {
      return res.status(404).json({ message: 'No se encontraron productos.' });
    }
    res.json(productos);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Error interno del servidor.' });
  }
};

export default getProductosByIdEstablecimiento; 