import express from 'express';
import db from '../config/config-db';

const router = express.Router();

router.get('/tables', async (req, res) => {
    try {
        const query = `
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
        `;
        const result = await db.query(query);
        res.json({
            success: true,
            tables: result.rows.map(row => row.table_name)
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Error al obtener las tablas',
            details: error
        });
    }
});

export default router; 