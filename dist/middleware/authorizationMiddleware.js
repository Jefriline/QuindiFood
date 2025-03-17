"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorizeAdmin = authorizeAdmin;
exports.authorizeOwner = authorizeOwner;
function authorizeAdmin(req, res, next) {
    if (req.session.user && req.session.user.role === 'admin') {
        next();
    }
    else {
        res.status(403).json({ error: 'Access denied: Admin role required' });
    }
}
function authorizeOwner(req, res, next) {
    if (req.session.user && req.session.user.role === 'owner') {
        next();
    }
    else {
        res.status(403).json({ error: 'Access denied: Owner role required' });
    }
}
