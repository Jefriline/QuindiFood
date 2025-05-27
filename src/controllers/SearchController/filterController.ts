import { Request, Response } from 'express';
import SearchService from '../../services/SearchServices/SearchService';


const filter = async (req: Request, res: Response) => {
  try {
    const { disponibleAhora, precioMin, precioMax, tipoCocina, calificacionMin, calificacionMax} = req.query;

    console.log('Parámetros recibidos:', {
        disponibleAhora,
        precioMin,
        precioMax,
        tipoCocina,
        calificacionMin,
        calificacionMax
    });

    const resultado = await SearchService.filterByParams({
      disponibleAhora: disponibleAhora === 'true' ? true : undefined,
      precioMin: precioMin ? Number(precioMin) : undefined,
      precioMax: precioMax ? Number(precioMax) : undefined,
      tipoCocina: tipoCocina ? String(tipoCocina) : undefined,
      calificacionMin: calificacionMin ? Number(calificacionMin) : undefined,
      calificacionMax: calificacionMax ? Number(calificacionMax) : undefined
    });

    const { establecimientos, productos, sinEstablecimientosPorDisponibilidad } = resultado;

    const mensajes: string[] = [];

    if (!establecimientos.length) {
      if (sinEstablecimientosPorDisponibilidad) {
        mensajes.push('No hay establecimientos disponibles en este momento.');
      } else {
        let msg = 'No se encontraron establecimientos';
        if (tipoCocina) msg += ` para la categoría "${tipoCocina}"`;
        if (disponibleAhora === 'true') {
          msg += ' disponibles en este momento';
        }
        msg += '.';
        mensajes.push(msg);
      }
    }

    if (!productos.length) {
      let msg = 'No se encontraron productos';
      if (precioMin || precioMax) {
        msg += ` en el rango de precio${precioMin ? ' mínimo ' + precioMin : ''}${precioMax ? ' máximo ' + precioMax : ''}`;
      }
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
};



export default filter; 