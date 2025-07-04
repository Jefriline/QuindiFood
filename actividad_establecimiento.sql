-- Tabla para registrar actividades de establecimientos
CREATE TABLE actividad_establecimiento (
    id_actividad SERIAL PRIMARY KEY,
    FK_id_establecimiento INT NOT NULL REFERENCES establecimiento(id_establecimiento) ON DELETE CASCADE,
    FK_id_usuario INT REFERENCES usuario_general(id_usuario) ON DELETE SET NULL,
    tipo_actividad VARCHAR(50) NOT NULL CHECK (tipo_actividad IN ('vista_perfil', 'clic_contacto', 'nuevo_comentario')),
    fecha_actividad TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    datos_adicionales JSONB
);

-- Índices para mejorar performance
CREATE INDEX idx_actividad_establecimiento ON actividad_establecimiento(FK_id_establecimiento);
CREATE INDEX idx_actividad_fecha ON actividad_establecimiento(fecha_actividad);
CREATE INDEX idx_actividad_tipo ON actividad_establecimiento(tipo_actividad); 