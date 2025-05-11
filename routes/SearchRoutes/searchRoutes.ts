import express from 'express';
import searchByTerms from '../../controllers/SearchController/searchByTerms';
import validatorSearchByTerms from '../../middleware/SearchValidator/searchByTerms';

const router = express.Router();

router.get('/suggestions',
    validatorSearchByTerms.validatorSearchByTerms,
    searchByTerms
);

export default router; 