import { Request, Response, NextFunction } from 'express';

const validatorFilterSearch = {
    validatorFilterSearch: (req: Request, res: Response, next: NextFunction) => {
        if (req.query.precioMin && isNaN(Number(req.query.precioMin))) {
            return res.status(400).json({ error: 'precioMin debe ser un número' });
        }
        if (req.query.precioMax && isNaN(Number(req.query.precioMax))) {
            return res.status(400).json({ error: 'precioMax debe ser un número' });
        }
        if (req.query.valoracionMin && isNaN(Number(req.query.valoracionMin))) {
            return res.status(400).json({ error: 'valoracionMin debe ser un número' });
        }
        next();
    }
};

export default validatorFilterSearch; 