import EventoRepository from '../../repositories/EventoRepository/eventoRepository';
import CrearEventoDto from '../../Dto/EventoDto/crearEventoDto';
import PatrocinadorDto from '../../Dto/EventoDto/patrocinadorDto';

class EventoService {
    static async crearEvento(eventoDto: CrearEventoDto, id_admin: number) {
        try {
            if (!id_admin) {
                return { success: false, message: 'No se pudo obtener el ID del administrador.' };
            }
            const evento = await EventoRepository.crearEvento(eventoDto, id_admin);
            return { success: true, evento };
        } catch (error: any) {
            console.error('Error en el servicio al crear evento:', error);
            return { success: false, message: error.message || 'Error al crear evento' };
        }
    }

    static async agregarParticipacion(participacionDto: any) {
        try {
            const participacion = await EventoRepository.agregarParticipacion(participacionDto);
            return { success: true, participacion };
        } catch (error: any) {
            console.error('Error en el servicio al agregar participación:', error);
            return { success: false, message: error.message || 'Error al agregar participación' };
        }
    }

    static async editarEvento(id: number, updateFields: any) {
        try {
            // Verificar si el evento existe
            const evento = await EventoRepository.getEventoById(id);
            if (!evento) {
                return { success: false, message: 'El evento no existe.' };
            }
            // Actualizar solo los campos enviados
            const actualizado = await EventoRepository.updateEvento(id, updateFields);
            if (!actualizado) {
                return { success: false, message: 'No se pudo actualizar el evento.' };
            }
            // Obtener el evento actualizado
            const eventoActualizado = await EventoRepository.getEventoById(id);
            return { success: true, evento: eventoActualizado };
        } catch (error: any) {
            return { success: false, message: error.message };
        }
    }

    static async eliminarEvento(id: number) {
        try {
            // Verificar si el evento existe
            const evento = await EventoRepository.getEventoById(id);
            if (!evento) {
                return { success: false, message: 'El evento no existe.' };
            }

            // Eliminar el evento
            const eliminado = await EventoRepository.eliminarEvento(id);
            if (!eliminado) {
                return { success: false, message: 'No se pudo eliminar el evento.' };
            }

            return { success: true };
        } catch (error: any) {
            return { success: false, message: error.message };
        }
    }


    static async editarParticipacionPorId(id_participacion: number, updateFields: any) {
        try {
            // Verificar si la participación existe
            const participacion = await EventoRepository.getParticipacionByIdParticipacion(id_participacion);
            if (!participacion) {
                return { success: false, message: 'La participación no existe.' };
            }

            // Actualizar la participación
            const actualizado = await EventoRepository.updateParticipacionPorId(id_participacion, updateFields);
            if (!actualizado) {
                return { success: false, message: 'No se pudo actualizar la participación.' };
            }

            // Obtener la participación actualizada
            const participacionActualizada = await EventoRepository.getParticipacionByIdParticipacion(id_participacion);
            return { success: true, participacion: participacionActualizada };
        } catch (error: any) {
            return { success: false, message: error.message };
        }
    }

    static async eliminarParticipacionPorId(id_participacion: number) {
        try {
            // Verificar si la participación existe
            const participacion = await EventoRepository.getParticipacionByIdParticipacion(id_participacion);
            if (!participacion) {
                return { success: false, message: 'La participación no existe.' };
            }

            // Eliminar la participación
            const eliminado = await EventoRepository.eliminarParticipacionPorId(id_participacion);
            if (!eliminado) {
                return { success: false, message: 'No se pudo eliminar la participación.' };
            }

            return { success: true };
        } catch (error: any) {
            return { success: false, message: error.message };
        }
    }

    static async listarEventosPublico() {
        return await EventoRepository.listarEventosPublico();
    }

    static async detalleEventoPublico(id_evento: number) {
        return await EventoRepository.detalleEventoPublico(id_evento);
    }

    static async agregarPatrocinador(id_evento: number, dto: PatrocinadorDto) {
        try {
            // Verificar que el evento existe
            const evento = await EventoRepository.detalleEventoPublico(id_evento);
            if (!evento) {
                return { success: false, message: 'El evento no existe. No se puede agregar patrocinador.' };
            }
            const patrocinador = await EventoRepository.agregarPatrocinador(id_evento, { nombre: dto.nombre || '', logo: dto.logo || '' });
            return { success: true, patrocinador };
        } catch (error: any) {
            return { success: false, message: error.message || 'Error al agregar patrocinador' };
        }
    }

    static async editarPatrocinador(id_patrocinador_evento: number, dto: PatrocinadorDto) {
        try {
            const updateFields: any = {};
            if (dto.nombre !== undefined) updateFields.nombre = dto.nombre;
            if (dto.logo !== undefined) updateFields.logo = dto.logo;
            if (!updateFields || Object.keys(updateFields).length === 0) {
                return { success: false, message: 'Debes enviar al menos un campo para actualizar.' };
            }
            const patrocinador = await EventoRepository.editarPatrocinador(id_patrocinador_evento, updateFields);
            if (!patrocinador) {
                return { success: false, message: 'Patrocinador no encontrado' };
            }
            return { success: true, patrocinador };
        } catch (error: any) {
            return { success: false, message: error.message || 'Error al editar patrocinador' };
        }
    }

    static async eliminarPatrocinador(id_patrocinador_evento: number) {
        try {
            const eliminado = await EventoRepository.eliminarPatrocinador(id_patrocinador_evento);
            if (!eliminado) {
                return { success: false, message: 'Patrocinador no encontrado' };
            }
            return { success: true };
        } catch (error: any) {
            return { success: false, message: error.message || 'Error al eliminar patrocinador' };
        }
    }
}

export default EventoService; 