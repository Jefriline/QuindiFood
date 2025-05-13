import db from '../../config/config-db';
import { EstablecimientoDto } from '../../Dto/EstablecimientoDto/establecimientoDto';
import { MultimediaEstablecimientoDto } from '../../Dto/EstablecimientoDto/multimediaEstablecimientoDto';
import { ContactoEstablecimientoDto } from '../../Dto/EstablecimientoDto/contactoEstablecimientoDto';
import { DocumentacionDto } from '../../Dto/EstablecimientoDto/documentacionDto';
import { EstadoMembresiaDto } from '../../Dto/EstablecimientoDto/estadoMembresiaDto';

class EstablecimientoRepository {
    static async add(
        establecimiento: EstablecimientoDto,
        multimedia: MultimediaEstablecimientoDto,
        contactos: ContactoEstablecimientoDto[],
        documentacion: DocumentacionDto,
        estadoMembresia: EstadoMembresiaDto
    ) {
        // Insertar establecimiento
        const sqlEstablecimiento = 'INSERT INTO establecimiento (nombre, ubicacion, telefono, descripcion, estado) VALUES ($1, $2, $3, $4, $5) RETURNING id_establecimiento';
        const valuesEstablecimiento = [
            establecimiento.nombre,
            establecimiento.ubicacion,
            establecimiento.telefono,
            establecimiento.descripcion,
            estadoMembresia.estado
        ];
        const result = await db.query(sqlEstablecimiento, valuesEstablecimiento);
        const idEstablecimiento = result.rows[0].id_establecimiento;

        // Insertar multimedia como binario
        const sqlMultimedia = 'INSERT INTO multimedia_establecimiento (fk_id_establecimiento, multimedia) VALUES ($1, $2)';
        for (const item of multimedia.multimedia) {
            await db.query(sqlMultimedia, [idEstablecimiento, item]);
        }

        // Insertar contactos
        const sqlContacto = 'INSERT INTO Contacto_establecimiento (fk_id_establecimiento, url) VALUES ($1, $2)';
        for (const contacto of contactos) {
            await db.query(sqlContacto, [idEstablecimiento, contacto.url]);
        }

        // Insertar documentación
        const sqlDocumentacion = 'INSERT INTO documentacion (fk_id_establecimiento, registro_mercantil, rut, certificado_salud, registro_invima) VALUES ($1, $2, $3, $4, $5)';
        await db.query(sqlDocumentacion, [
            idEstablecimiento,
            documentacion.registro_mercantil,
            documentacion.rut,
            documentacion.certificado_salud,
            documentacion.registro_invima
        ]);

        return result.rows[0];
    }
}

export default EstablecimientoRepository; 