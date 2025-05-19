import jwt from 'jsonwebtoken';

const verifyTokenRefresh = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ success: false, message: 'Token no proporcionado' });
    }
    const token = authHeader.split(' ')[1];
    try {
        // Ignora la expiración
        const decoded = jwt.verify(token, process.env.KEY_TOKEN, { ignoreExpiration: true });
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ success: false, message: 'Token no válido' });
    }
};

export default verifyTokenRefresh; 