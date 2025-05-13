import { Request, Response } from 'express';
import SearchService from '../../services/SearchServices/SearchService';

const filterSearch = async (req: Request, res: Response) => {
    try {
        const sugerencias = await SearchService.filterSearch(req.query);
        res.json({ 
            establecimientos: sugerencias.establecimientos,
            productos: sugerencias.productos
        });
    } catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ error: error.message });
        } else {
            res.status(500).json({ error: 'Error interno del servidor' });
        }
    }
};

export default filterSearch; 