import ComentarioRepository from '../../repositories/ComentarioRepository/comentarioRepository';
import { ComentarioDto } from '../../Dto/ComentarioDto/comentarioDto';

class ComentarioService {
    static async addComentario(id_usuario: number, id_establecimiento: number, cuerpo_comentario: string, id_comentario_padre?: number) {
        try {
            const comentario = new ComentarioDto(id_usuario, id_establecimiento, cuerpo_comentario, id_comentario_padre);
            const result = await ComentarioRepository.addComentario(comentario);
            return {
                status: 'Éxito',
                comentario: result
            };
        } catch (error: any) {
            console.error('Error en el servicio al añadir comentario:', error);
            throw new Error(error.message || 'Error al añadir comentario');
        }
    }

    static async deleteComentarioByIdAndUsuario(id_comentario: number, id_usuario: number) {
        try {
            await ComentarioRepository.deleteComentarioByIdAndUsuario(id_comentario, id_usuario);
            return {
                status: 'Éxito',
                message: 'Comentario eliminado correctamente'
            };
        } catch (error: any) {
            console.error('Error en el servicio al eliminar comentario:', error);
            throw new Error(error.message || 'Error al eliminar comentario');
        }
    }

    static async deleteComentarioByIdAdmin(id_comentario: number) {
        try {
            await ComentarioRepository.deleteComentarioByIdAdmin(id_comentario);
            return {
                status: 'Éxito',
                message: 'Comentario eliminado correctamente por administrador'
            };
        } catch (error: any) {
            console.error('Error en el servicio al eliminar comentario (admin):', error);
            throw new Error(error.message || 'Error al eliminar comentario');
        }
    }

    static async getComentariosByEstablecimiento(id_establecimiento: number) {
        try {
            const comentarios = await ComentarioRepository.getComentariosByEstablecimiento(id_establecimiento);
            if (comentarios.length === 0) {
                return {
                    status: 'Éxito',
                    message: 'No hay comentarios para este establecimiento',
                    comentarios: []
                };
            }
            return {
                status: 'Éxito',
                comentarios
            };
        } catch (error: any) {
            console.error('Error en el servicio al obtener comentarios de establecimiento:', error);
            throw new Error(error.message || 'Error al obtener comentarios');
        }
    }

    static async getComentariosByUsuario(id_usuario: number) {
        try {
            const comentarios = await ComentarioRepository.getComentariosByCliente(id_usuario);
            if (comentarios.length === 0) {
                return {
                    status: 'Éxito',
                    message: 'No tienes comentarios registrados',
                    comentarios: []
                };
            }
            return {
                status: 'Éxito',
                comentarios
            };
        } catch (error: any) {
            console.error('Error en el servicio al obtener comentarios de usuario:', error);
            throw new Error(error.message || 'Error al obtener comentarios');
        }
    }

    static async getComentariosByEstablecimientoPaginado(id_establecimiento: number, page: number, limit: number) {
        try {
            const offset = (page - 1) * limit;
            // 1. Obtener comentarios principales paginados
            const comentariosPrincipales = await ComentarioRepository.getComentariosPrincipalesPaginados(id_establecimiento, limit, offset);
            // 2. Obtener todas las respuestas de estos comentarios principales (recursivo)
            const armarArbol = async (comentariosPadre: any[]): Promise<any[]> => {
                const map = new Map<number, any>();
                comentariosPadre.forEach((c: any) => map.set(c.id_comentario, { ...c, respuestas: [] }));
                let pendientes: any[] = [...comentariosPadre];
                while (pendientes.length > 0) {
                    const ids = pendientes.map((c: any) => c.id_comentario);
                    const respuestas = await ComentarioRepository.getRespuestasDeComentarios(ids);
                    respuestas.forEach((r: any) => {
                        if (map.has(r.id_comentario_padre)) {
                            map.get(r.id_comentario_padre).respuestas.push({ ...r, respuestas: [] });
                        }
                    });
                    pendientes = respuestas;
                    respuestas.forEach((r: any) => map.set(r.id_comentario, { ...r, respuestas: map.get(r.id_comentario)?.respuestas || [] }));
                }
                // Solo devolver los principales con árbol completo
                return comentariosPadre.map((c: any) => map.get(c.id_comentario));
            };
            const arbol = await armarArbol(comentariosPrincipales);
            // 3. Totales
            const total_comentarios_principales = await ComentarioRepository.countComentariosPrincipales(id_establecimiento);
            const total_comentarios_incluyendo_respuestas = await ComentarioRepository.countComentariosTotales(id_establecimiento);
            return {
                status: 'Éxito',
                page,
                limite_comentarios_principales_por_pagina: limit,
                total_comentarios_principales,
                total_comentarios_incluyendo_respuestas,
                comentarios: arbol
            };
        } catch (error: any) {
            console.error('Error en el servicio al obtener comentarios paginados:', error);
            throw new Error(error.message || 'Error al obtener comentarios paginados');
        }
    }
}

export default ComentarioService; 