import { Request, Response } from 'express';
import { EstablecimientoDto } from '../../Dto/EstablecimientoDto/establecimientoDto';
import { MultimediaEstablecimientoDto } from '../../Dto/EstablecimientoDto/multimediaEstablecimientoDto';
import { ContactoEstablecimientoDto } from '../../Dto/EstablecimientoDto/contactoEstablecimientoDto';
import { DocumentacionDto } from '../../Dto/EstablecimientoDto/documentacionDto';
import { EstadoMembresiaDto } from '../../Dto/EstablecimientoDto/estadoMembresiaDto';
import EstablecimientoService from '../../services/EstablecimientoService/establecimientoService';

const registerEstablecimiento = async (req: Request, res: Response) => {
    try {
        const {
            nombre,
            ubicacion,
            telefono,
            descripcion,
            estadoMembresia
        } = req.body;

        const files = req.files as { [fieldname: string]: Express.Multer.File[] };

        // Crear el DTO principal con solo la información básica
        const establecimiento = new EstablecimientoDto(
            nombre,
            ubicacion,
            telefono,
            descripcion
        );

        // Procesar archivos multimedia
        const multimediaFiles = files['multimedia'] || [];
        const multimediaBuffers = multimediaFiles.map(file => file.buffer);
        const multimediaDto = new MultimediaEstablecimientoDto(multimediaBuffers);

        // Procesar documentación
        const documentacionDto = new DocumentacionDto(
            files['registro_mercantil']?.[0]?.buffer.toString('base64') || '',
            files['rut']?.[0]?.buffer.toString('base64') || '',
            files['certificado_salud']?.[0]?.buffer.toString('base64') || '',
            files['registro_invima']?.[0]?.buffer.toString('base64')
        );

        const estadoMembresiaDto = new EstadoMembresiaDto(estadoMembresia || 'Activo');

        // Enviar todos los DTOs al servicio
        await EstablecimientoService.add(
            establecimiento,
            multimediaDto,
            [], // No usamos contactos por ahora
            documentacionDto,
            estadoMembresiaDto
        );

        return res.status(201).json({
            message: 'Establecimiento registrado exitosamente',
            data: {
                nombre,
                ubicacion,
                telefono,
                descripcion
            }
        });
    } catch (error) {
        console.error('Error al registrar establecimiento:', error);
        return res.status(500).json({
            message: 'Error al registrar el establecimiento',
            error: error instanceof Error ? error.message : 'Error desconocido'
        });
    }
};

export default registerEstablecimiento; 