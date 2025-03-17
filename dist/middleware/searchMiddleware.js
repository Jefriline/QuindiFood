"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.filterSearch = filterSearch;
exports.suggestSearch = suggestSearch;
function filterSearch(req, res, next) {
    const { query, filters } = req.body;
    req.filteredQuery = applyFilters(query, filters);
    next();
}
function suggestSearch(req, res, next) {
    const { term } = req.body;
    req.suggestions = getSearchSuggestions(term);
    next();
}
function applyFilters(query, filters) {
    return { query, filters };
}
function getSearchSuggestions(term) {
    return [];
}
