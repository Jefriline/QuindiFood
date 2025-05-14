import { Request, Response } from 'express';
import SearchService from '../../services/SearchServices/SearchService';

const searchByTerms = async (req: Request, res: Response) => {
    try {
        const q = req.query.q as string;
        const sugerencias = await SearchService.searchByTerms(q);
        const establecimientos = sugerencias.filter(s => s.tipo === 'establecimiento');
        const productos = sugerencias.filter(s => s.tipo === 'producto');
        res.json({ establecimientos, productos });
    } catch (error) {
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

export default searchByTerms; 