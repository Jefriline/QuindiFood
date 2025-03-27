import db from '../config/config-db';
import fs from 'fs';
import path from 'path';

async function crearTablaFavoritos() {
    try {
        const sql = fs.readFileSync(path.join(__dirname, '../sql/crear_tabla_favoritos.sql'), 'utf8');
        await db.query(sql);
        console.log('Tabla favoritos creada exitosamente');
    } catch (error) {
        console.error('Error al crear la tabla favoritos:', error);
    } finally {
        await db.end();
    }
}

crearTablaFavoritos(); 