import { EstablecimientoDto } from '../../Dto/EstablecimientoDto/establecimientoDto';
import { MultimediaEstablecimientoDto } from '../../Dto/EstablecimientoDto/multimediaEstablecimientoDto';
import { ContactoEstablecimientoDto } from '../../Dto/EstablecimientoDto/contactoEstablecimientoDto';
import { DocumentacionDto } from '../../Dto/EstablecimientoDto/documentacionDto';
import { EstadoMembresiaDto } from '../../Dto/EstablecimientoDto/estadoMembresiaDto';
import EstablecimientoRepository from '../../repositories/EstablecimientoRepository/establecimientoRepository';
import generateHash from '../../Helpers/Hash/generateHash';

class EstablecimientoService {
    async add(
        establecimiento: EstablecimientoDto,
        multimedia: MultimediaEstablecimientoDto,
        contactos: ContactoEstablecimientoDto[],
        documentacion: DocumentacionDto,
        estadoMembresia: EstadoMembresiaDto
    ) {
        try {
            // Hashear los documentos
            const registroMercantilHash = await generateHash(documentacion.registro_mercantil.toString('base64'));
            const rutHash = await generateHash(documentacion.rut.toString('base64'));
            const certificadoSaludHash = await generateHash(documentacion.certificado_salud.toString('base64'));
            const registroInvimaHash = documentacion.registro_invima 
                ? await generateHash(documentacion.registro_invima.toString('base64'))
                : null;

            // Crear un nuevo DTO de documentación con los hashes
            const documentacionHash = new DocumentacionDto(
                Buffer.from(registroMercantilHash),
                Buffer.from(rutHash),
                Buffer.from(certificadoSaludHash),
                registroInvimaHash ? Buffer.from(registroInvimaHash) : undefined
            );

            // Hashear la multimedia
            const multimediaHash = await generateHash(multimedia.multimedia.toString('base64'));

            // Crear un nuevo DTO de multimedia con el hash
            const multimediaHashDto = new MultimediaEstablecimientoDto(Buffer.from(multimediaHash));

            // Guardar en la base de datos usando el repositorio
            await EstablecimientoRepository.add(
                establecimiento,
                multimediaHashDto,
                contactos,
                documentacionHash,
                estadoMembresia
            );

            return true;
        } catch (error) {
            console.error('Error en EstablecimientoService.add:', error);
            throw error;
        }
    }
}

export default new EstablecimientoService(); 