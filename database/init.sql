-- Crear tabla usuario_general
CREATE TABLE IF NOT EXISTS usuario_general (
    id_usuario SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    contraseña VARCHAR(255) NOT NULL,
    estado VARCHAR(20) DEFAULT 'Activo',
    role VARCHAR(20) DEFAULT 'CLIENTE'
);

-- Crear tabla cliente
CREATE TABLE IF NOT EXISTS cliente (
    id_cliente INTEGER PRIMARY KEY REFERENCES usuario_general(id_usuario)
);

-- Crear tabla propietario
CREATE TABLE IF NOT EXISTS propietario (
    id_propietario INTEGER PRIMARY KEY REFERENCES usuario_general(id_usuario)
);

-- Crear tabla administrador
CREATE TABLE IF NOT EXISTS administrador (
    id_admin INTEGER PRIMARY KEY REFERENCES usuario_general(id_usuario)
); 