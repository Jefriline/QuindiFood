-- Script para actualizar el constraint de actividad_establecimiento
-- Primero eliminamos el constraint existente
ALTER TABLE actividad_establecimiento DROP CONSTRAINT IF EXISTS actividad_establecimiento_tipo_actividad_check;

-- Luego creamos el nuevo constraint con todos los tipos permitidos
ALTER TABLE actividad_establecimiento ADD CONSTRAINT actividad_establecimiento_tipo_actividad_check 
CHECK (tipo_actividad IN (
    'click_establecimiento',
    'click_producto', 
    'click_promocion',
    'comentario_agregado',
    'comentario_eliminado',
    'puntuacion_agregada',
    'puntuacion_actualizada',
    'puntuacion_eliminada',
    'favorito_agregado',
    'favorito_eliminado',
    'evento_creado',
    'evento_editado',
    'evento_eliminado',
    'participacion_evento',
    'patrocinio_evento',
    'limpieza_automatica'
));

-- Permitir valores NULL en fk_id_establecimiento para logs del sistema
ALTER TABLE actividad_establecimiento ALTER COLUMN fk_id_establecimiento DROP NOT NULL;

-- Verificar que el constraint se aplicó correctamente
SELECT conname, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conrelid = 'actividad_establecimiento'::regclass 
AND contype = 'c'; 