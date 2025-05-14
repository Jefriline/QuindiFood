import { Request, Response } from 'express';
import listProductoService from '../../services/ProductoService/listProductoService';

const listProductos = async (req: Request, res: Response) => {
  try {
    const productos = await listProductoService.listProductos();
    res.json({ productos });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Error interno del servidor.' });
  }
};

export default listProductos; 