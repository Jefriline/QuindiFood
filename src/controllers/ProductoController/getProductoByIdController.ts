import { Request, Response } from 'express';
import listProductoService from '../../services/ProductoService/listProductoService';

const getProductoById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const producto = await listProductoService.getProductoById(Number(id));
    if (!producto) {
      return res.status(404).json({ message: 'No se encontró el producto.' });
    }
    res.json(producto);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Error interno del servidor.' });
  }
};

export default getProductoById; 