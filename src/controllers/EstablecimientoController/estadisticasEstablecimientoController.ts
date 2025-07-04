import { Request, Response } from 'express';
import { ActividadService } from '../../services/ActividadService/actividadService';

// Obtener estadísticas del establecimiento
export const obtenerEstadisticas = async (req: Request, res: Response) => {
  try {
    const { idEstablecimiento } = req.params;
    const { fechaInicio, fechaFin } = req.query;

    console.log('Obteniendo estadísticas para establecimiento:', idEstablecimiento);

    const estadisticas = await ActividadService.obtenerEstadisticasCompletas(
      parseInt(idEstablecimiento),
      fechaInicio as string,
      fechaFin as string
    );

    res.status(200).json({
      success: true,
      message: 'Estadísticas obtenidas exitosamente',
      data: estadisticas
    });
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor al obtener estadísticas',
      error: process.env.NODE_ENV === 'development' ? error : {}
    });
  }
};

// Registrar vista de perfil
export const registrarVistaPerfil = async (req: Request, res: Response) => {
  try {
    const { idEstablecimiento } = req.params;
    const idUsuario = (req as any).user?.id; // Del middleware de autenticación

    console.log('Registrando vista de perfil para establecimiento:', idEstablecimiento);

    await ActividadService.registrarVistaPerfil(
      parseInt(idEstablecimiento),
      idUsuario
    );

    res.status(200).json({
      success: true,
      message: 'Vista de perfil registrada exitosamente'
    });
  } catch (error) {
    console.error('Error al registrar vista de perfil:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Registrar clic en contacto
export const registrarClicContacto = async (req: Request, res: Response) => {
  try {
    const { idEstablecimiento } = req.params;
    const { tipoContacto } = req.body; // 'telefono', 'email', 'whatsapp', etc.
    const idUsuario = (req as any).user?.id;

    console.log('Registrando clic en contacto:', { idEstablecimiento, tipoContacto });

    await ActividadService.registrarClicContacto(
      parseInt(idEstablecimiento),
      tipoContacto,
      idUsuario
    );

    res.status(200).json({
      success: true,
      message: 'Clic en contacto registrado exitosamente'
    });
  } catch (error) {
    console.error('Error al registrar clic en contacto:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Exportar datos de actividad
export const exportarDatos = async (req: Request, res: Response) => {
  try {
    const { idEstablecimiento } = req.params;
    const { fechaInicio, fechaFin, formato } = req.query;

    console.log('Exportando datos para establecimiento:', idEstablecimiento);

    const datos = await ActividadService.obtenerDatosExportar(
      parseInt(idEstablecimiento),
      fechaInicio as string,
      fechaFin as string
    );

    if (formato === 'csv') {
      // Generar CSV
      const csvHeader = 'Fecha,Tipo de Actividad,Usuario,Email,Datos Adicionales\n';
      const csvContent = datos.map((row: any) => 
        `${row.fecha_actividad},${row.tipo_actividad},${row.nombre_usuario || 'Anónimo'},${row.email_usuario || ''},${row.datos_adicionales ? JSON.stringify(row.datos_adicionales) : ''}`
      ).join('\n');
      
      const csv = csvHeader + csvContent;
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="estadisticas_establecimiento_${idEstablecimiento}.csv"`);
      res.send(csv);
    } else {
      // Retornar JSON
      res.status(200).json({
        success: true,
        message: 'Datos exportados exitosamente',
        data: datos
      });
    }
  } catch (error) {
    console.error('Error al exportar datos:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor al exportar datos'
    });
  }
}; 