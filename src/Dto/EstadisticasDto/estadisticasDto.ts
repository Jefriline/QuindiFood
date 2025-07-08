// DTO para estadísticas de actividad de establecimiento
export interface EstadisticasActividadDto {
    periodo: string; // 'dia', 'semana', 'mes', 'trimestre'
    fecha_inicio: string;
    fecha_fin: string;
    establecimiento_id: number;
}

// DTO para respuesta de estadísticas generales
export interface EstadisticasGeneralesDto {
    puntuaciones: {
        total: number;
        promedio: number;
        distribucion: {
            cinco_estrellas: number;
            cuatro_estrellas: number;
            tres_estrellas: number;
            dos_estrellas: number;
            una_estrella: number;
        };
    };
    actividad: {
        clics_perfil: number;
        comentarios_totales: number;
        favoritos_totales: number;
        busquedas: number;
    };
    comentarios: {
        total: number;
        sentimiento: {
            positivos: number;
            neutrales: number;
            negativos: number;
        };
        porcentajes: {
            positivos: number;
            neutrales: number;
            negativos: number;
        };
    };
}

// DTO para datos de gráficas de barras (actividad por tiempo)
export interface GraficaBarrasDto {
    labels: string[]; // Fechas o períodos
    datasets: [{
        label: string;
        data: number[];
        backgroundColor: string;
        borderColor: string;
        borderWidth: number;
    }];
}

// DTO para gráfico circular (tipos de interacción)
export interface GraficoCircularDto {
    labels: string[];
    datasets: [{
        data: number[];
        backgroundColor: string[];
        borderColor: string[];
        borderWidth: number;
    }];
}

// DTO para actividad detallada por día
export interface ActividadDiariaDto {
    fecha: string;
    clics_perfil: number;
    comentarios: number;
    puntuaciones: number;
    favoritos: number;
    busquedas: number;
    total: number;
}

// DTO para exportar estadísticas
export interface ExportarEstadisticasDto {
    establecimiento: {
        id: number;
        nombre: string;
        categoria: string;
    };
    periodo: {
        inicio: string;
        fin: string;
        tipo: string;
    };
    resumen: EstadisticasGeneralesDto;
    actividad_diaria: ActividadDiariaDto[];
    fecha_generacion: string;
}

// DTO para filtros de estadísticas
export interface FiltrosEstadisticasDto {
    fecha_inicio?: string;
    fecha_fin?: string;
    tipo_periodo?: 'dia' | 'semana' | 'mes' | 'trimestre' | 'año';
    tipos_actividad?: string[];
}

// DTO para respuesta de dashboard de estadísticas
export interface DashboardEstadisticasDto {
    estadisticas_generales: EstadisticasGeneralesDto;
    grafica_actividad: GraficaBarrasDto;
    grafico_interacciones: GraficoCircularDto;
    actividad_reciente: ActividadDiariaDto[];
    tendencias: {
        clics_vs_mes_anterior: number;
        comentarios_vs_mes_anterior: number;
        puntuacion_vs_mes_anterior: number;
    };
} 