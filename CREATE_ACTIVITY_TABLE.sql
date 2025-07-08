-- Tabla para registrar actividad de establecimientos
-- Los registros se eliminan automáticamente después de 3 meses
CREATE TABLE actividad_establecimiento (
    id_actividad SERIAL PRIMARY KEY,
    fk_id_establecimiento INT NOT NULL REFERENCES establecimiento(id_establecimiento) ON DELETE CASCADE,
    fk_id_usuario INT REFERENCES usuario_general(id_usuario) ON DELETE SET NULL, -- NULL para usuarios anónimos
    tipo_actividad VARCHAR(50) NOT NULL 
        CHECK (tipo_actividad IN ('clic_perfil', 'comentario', 'puntuacion', 'favorito', 'busqueda', 'limpieza_automatica')),
    fecha_actividad TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    datos_adicionales JSONB -- Para almacenar información extra como IP, dispositivo, etc.
);

-- Índices para optimizar consultas de estadísticas
CREATE INDEX idx_actividad_establecimiento ON actividad_establecimiento(fk_id_establecimiento);
CREATE INDEX idx_actividad_fecha ON actividad_establecimiento(fecha_actividad);
CREATE INDEX idx_actividad_tipo ON actividad_establecimiento(tipo_actividad);
CREATE INDEX idx_actividad_usuario ON actividad_establecimiento(fk_id_usuario);

-- Índice compuesto para consultas de estadísticas por rango de fechas
CREATE INDEX idx_actividad_estab_fecha ON actividad_establecimiento(fk_id_establecimiento, fecha_actividad);

-- Función para eliminar registros antiguos (más de 3 meses)
CREATE OR REPLACE FUNCTION limpiar_actividad_antigua() 
RETURNS void AS $$
BEGIN
    DELETE FROM actividad_establecimiento 
    WHERE fecha_actividad < NOW() - INTERVAL '3 months';
    
    -- Log de limpieza
    INSERT INTO actividad_establecimiento (fk_id_establecimiento, tipo_actividad, datos_adicionales)
    VALUES (0, 'limpieza_automatica', 
            jsonb_build_object('fecha_limpieza', NOW(), 'registros_eliminados', ROW_COUNT()));
END;
$$ LANGUAGE plpgsql;

-- Programar limpieza automática (requiere extensión pg_cron si está disponible)
-- SELECT cron.schedule('limpiar-actividad', '0 2 * * *', 'SELECT limpiar_actividad_antigua();'); 