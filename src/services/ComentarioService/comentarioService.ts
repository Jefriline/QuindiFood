import ComentarioRepository from '../../repositories/ComentarioRepository/comentarioRepository';
import { ComentarioDto } from '../../Dto/ComentarioDto/comentarioDto';

class ComentarioService {
    static async addComentario(id_cliente: number, id_establecimiento: number, cuerpo_comentario: string, id_comentario_padre?: number) {
        try {
            const comentario = new ComentarioDto(id_cliente, id_establecimiento, cuerpo_comentario, id_comentario_padre);
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

    static async deleteComentarioByIdAndCliente(id_comentario: number, id_cliente: number) {
        try {
            await ComentarioRepository.deleteComentarioByIdAndCliente(id_comentario, id_cliente);
            return { status: 'Éxito', message: 'Comentario eliminado correctamente' };
        } catch (error: any) {
            console.error('Error en el servicio al eliminar comentario:', error);
            throw new Error(error.message || 'Error al eliminar comentario');
        }
    }

    static async deleteComentarioByIdAdmin(id_comentario: number) {
        try {
            await ComentarioRepository.deleteComentarioByIdAdmin(id_comentario);
            return { status: 'Éxito', message: 'Comentario eliminado por administrador' };
        } catch (error: any) {
            console.error('Error en el servicio al eliminar comentario como admin:', error);
            throw new Error(error.message || 'Error al eliminar comentario como admin');
        }
    }

    static async getComentariosByEstablecimiento(id_establecimiento: number) {
        try {
            const comentarios = await ComentarioRepository.getComentariosByEstablecimiento(id_establecimiento);
            // Construir árbol de comentarios
            const map = new Map();
            comentarios.forEach(c => map.set(c.id_comentario, { ...c, respuestas: [] }));
            const arbol: any[] = [];
            comentarios.forEach(c => {
                if (c.id_comentario_padre) {
                    map.get(c.id_comentario_padre).respuestas.push(map.get(c.id_comentario));
                } else {
                    arbol.push(map.get(c.id_comentario));
                }
            });
            return arbol;
        } catch (error: any) {
            console.error('Error en el servicio al obtener comentarios de establecimiento:', error);
            throw new Error(error.message || 'Error al obtener comentarios de establecimiento');
        }
    }

    static async getComentariosByCliente(id_cliente: number) {
        try {
            const comentarios = await ComentarioRepository.getComentariosByCliente(id_cliente);
            // Formatear respuesta plana con esRespuesta y id_comentario_padre
            return comentarios.map(c => ({
                id_comentario: c.id_comentario,
                FK_id_establecimiento: c.fk_id_establecimiento,
                cuerpo_comentario: c.cuerpo_comentario,
                fecha: c.fecha,
                esRespuesta: c.id_comentario_padre !== null,
                id_comentario_padre: c.id_comentario_padre
            }));
        } catch (error: any) {
            console.error('Error en el servicio al obtener mis comentarios:', error);
            throw new Error(error.message || 'Error al obtener mis comentarios');
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