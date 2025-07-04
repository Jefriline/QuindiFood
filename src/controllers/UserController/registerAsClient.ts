import { Response } from 'express';
import { CustomRequest } from '../../interfaces/customRequest';
import db from '../../config/config-db';

const registerAsClient = async (req: CustomRequest, res: Response) => {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({
                success: false,
                message: 'Usuario no autenticado'
            });
        }

        const userId = req.user.id;

        // Verificar si el usuario existe
        const usuario = await db.query(
            'SELECT * FROM usuario_general WHERE id_usuario = $1',
            [userId]
        );

        if (usuario.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }

        // Verificar si ya es cliente
        const cliente = await db.query(
            'SELECT * FROM cliente WHERE id_cliente = $1',
            [userId]
        );

        if (cliente.rows.length > 0) {
            return res.status(200).json({
                success: true,
                message: 'El usuario ya está registrado como cliente'
            });
        }

        // Registrar como cliente
        await db.query(
            'INSERT INTO cliente (id_cliente) VALUES ($1)',
            [userId]
        );

        res.status(200).json({
            success: true,
            message: 'Usuario registrado como cliente exitosamente'
        });
    } catch (error) {
        console.error('Error al registrar como cliente:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
};

export default registerAsClient; 