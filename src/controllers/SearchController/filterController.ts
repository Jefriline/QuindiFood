import { Request, Response } from 'express';
import SearchService from '../../services/SearchServices/SearchService';


const filter = async (req: Request, res: Response) => {
  try {
    const { q, disponibleAhora, precioMin, precioMax, tipoCocina } = req.query;
    if (!q) {
      return res.status(400).json({ error: 'El parámetro q es obligatorio.' });
    }
    const resultados = await SearchService.filterByParams({
      q: String(q),
      disponibleAhora: disponibleAhora === 'true',
      precioMin: precioMin ? Number(precioMin) : undefined,
      precioMax: precioMax ? Number(precioMax) : undefined,
      tipoCocina: tipoCocina ? String(tipoCocina) : undefined,
    });

    // Separar resultados
    const establecimientos = resultados.filter(r => r.tipo === 'establecimiento' || r.tipo === 'establecimiento');
    const productos = resultados.filter(r => r.tipo === 'producto' || r.tipo === 'producto');

    const mensajes: string[] = [];
    if (!establecimientos.length) {
      let msg = 'No se encontraron establecimientos';
      if (tipoCocina) msg += ` para la categoría "${tipoCocina}"`;
      if (disponibleAhora === 'true') msg += ' disponibles en este momento';
      msg += '.';
      mensajes.push(msg);
    }
    if (!productos.length) {
      let msg = 'No se encontraron productos';
      if (precioMin || precioMax) msg += ` en el rango de precio${precioMin ? ' mínimo ' + precioMin : ''}${precioMax ? ' máximo ' + precioMax : ''}`;
      msg += '.';
      mensajes.push(msg);
    }

    if (!establecimientos.length && !productos.length) {
      return res.status(404).json({ mensajes });
    }

    res.json({ establecimientos, productos, mensajes });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Error interno del servidor.' });
  }
}
  


export default filter; 