import express from 'express';
import searchByTerms from '../../controllers/SearchController/searchByTerms';
import validatorSearchByTerms from '../../middleware/SearchValidator/searchByTerms';
import getCategories from '../../controllers/SearchController/getCategories';
import filter from '../../controllers/SearchController/filterController';
const router = express.Router();

router.get('/suggestions',
    validatorSearchByTerms.validatorSearchByTerms,
    searchByTerms
);

router.get('/categories', getCategories);

router.get('/filter', filter);


export default router; 