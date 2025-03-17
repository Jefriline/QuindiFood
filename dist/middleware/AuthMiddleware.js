"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateUser = authenticateUser;
exports.checkPasswordRecovery = checkPasswordRecovery;
function authenticateUser(req, res, next) {
    if (req.session.user) {
        next();
    }
    else {
        res.status(401).json({ error: 'Unauthorized: Please log in' });
    }
}
function checkPasswordRecovery(req, res, next) {
    const { email } = req.body;
    if (!email) {
        res.status(400).json({ error: 'Email is required for password recovery' });
        return;
    }
    next();
}
