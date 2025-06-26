import { Request, Response } from 'express';
import ListEstablecimientoService from '../../services/EstablecimientoService/listEstablecimientoService';

const getEstablecimientoById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Validar que el ID sea un número válido
    const idNumber = parseInt(id);
    if (!id || isNaN(idNumber) || idNumber <= 0) {
      return res.status(400).json({ 
        success: false,
        message: 'ID de establecimiento inválido' 
      });
    }
    
    const establecimiento = await ListEstablecimientoService.getEstablecimientoById(idNumber);
    if (!establecimiento) {
      return res.status(404).json({ 
        success: false,
        message: 'No se encontró el establecimiento.' 
      });
    }
    
    res.json({
      success: true,
      data: establecimiento
    });
  } catch (error: any) {
    console.error('Error en getEstablecimientoById:', error);
    res.status(500).json({ 
      success: false,
      error: error.message || 'Error interno del servidor.' 
    });
  }
};

export default getEstablecimientoById; 