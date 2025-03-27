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
            multimedia,
            contactos,
            registro_mercantil,
            rut,
            certificado_salud,
            registro_invima,
            estadoMembresia
        } = req.body;

        // Crear el DTO principal con solo la información básica
        const establecimiento = new EstablecimientoDto(
            nombre,
            ubicacion,
            telefono,
            descripcion
        );

        // Crear los DTOs específicos
        const multimediaDto = new MultimediaEstablecimientoDto(multimedia);
        const contactosDto = contactos.map((url: string) => new ContactoEstablecimientoDto(url));
        const documentacionDto = new DocumentacionDto(
            registro_mercantil,
            rut,
            certificado_salud,
            registro_invima
        );
        const estadoMembresiaDto = new EstadoMembresiaDto(estadoMembresia);

        // Enviar todos los DTOs al servicio
        await EstablecimientoService.add(
            establecimiento,
            multimediaDto,
            contactosDto,
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