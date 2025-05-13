import { Request, Response } from 'express';
import SearchService from '../../services/SearchServices/SearchService';

const getCategories = async (req: Request, res: Response) => {
    try {
        const categorias = await SearchService.getCategories();
        res.json(categorias);
    } catch (error) {
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

export default getCategories; 