"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logUserActivity = logUserActivity;
exports.logAdminActivity = logAdminActivity;
function logUserActivity(req, res, next) {
    console.log(`[${new Date().toISOString()}] User Activity: ${req.method} ${req.url}`);
    next();
}
function logAdminActivity(req, res, next) {
    console.log(`[${new Date().toISOString()}] Admin Activity: ${req.method} ${req.url}`);
    next();
}
