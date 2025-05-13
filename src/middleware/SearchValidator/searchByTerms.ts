import { Request, Response, NextFunction } from 'express';

const validatorSearchByTerms = {
    validatorSearchByTerms: (req: Request, res: Response, next: NextFunction) => {
        const q = (req.query.q as string)?.trim();
        if (!q) {
            return res.status(400).json({ error: 'El término de búsqueda no puede estar vacío.' });
        }
        next();
    }
};

export default validatorSearchByTerms; 