CREATE TABLE IF NOT EXISTS favoritos (
    id_favorito SERIAL PRIMARY KEY,
    fk_id_cliente INTEGER NOT NULL,
    fk_id_establecimiento INTEGER NOT NULL,
    fecha_agregado TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (fk_id_cliente) REFERENCES cliente(id_cliente) ON DELETE CASCADE,
    FOREIGN KEY (fk_id_establecimiento) REFERENCES establecimiento(id_establecimiento) ON DELETE CASCADE,
    UNIQUE(fk_id_cliente, fk_id_establecimiento)
); 