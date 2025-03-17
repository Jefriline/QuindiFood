"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidateRegistration = ValidateRegistration;
exports.ValidateEstablishmentCreation = ValidateEstablishmentCreation;
function ValidateRegistration(req, res, next) {
    const { email, password } = req.body;
    if (!email || !password) {
        res.status(400).json({ error: 'Email and password are required' });
        return;
    }
    next();
}
function ValidateEstablishmentCreation(req, res, next) {
    const { name, address } = req.body;
    if (!name || !address) {
        res.status(400).json({ error: 'Name And Address are Required' });
        return;
    }
    next();
}
