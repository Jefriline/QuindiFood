import express from 'express';
import searchByTerms from '../../controllers/SearchController/searchByTerms';
import validatorSearchByTerms from '../../middleware/SearchValidator/searchByTerms';
import getCategories from '../../controllers/SearchController/getCategories';
import filterSearch from '../../controllers/SearchController/filterSearch';
import validatorFilterSearch from '../../middleware/SearchValidator/filterSearch';

const router = express.Router();

router.get('/suggestions',
    validatorSearchByTerms.validatorSearchByTerms,
    searchByTerms
);

router.get('/categories', getCategories);

router.get('/filter',
    validatorFilterSearch.validatorFilterSearch,
    filterSearch
);

export default router; 