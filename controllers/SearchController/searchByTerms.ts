import { Request, Response } from 'express';
import SearchService from '../../services/SearchServices/SearchService';

const searchByTerms = async (req: Request, res: Response) => {
    try {
        const q = req.query.q as string;
        const sugerencias = await SearchService.searchByTerms(q);
        res.json({ sugerencias });
    } catch (error) {
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

export default searchByTerms; 