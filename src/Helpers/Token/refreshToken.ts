import jwt from 'jsonwebtoken';

export function refreshToken(oldToken: string, secret: string): string | null {
    try {
        const decoded = jwt.verify(oldToken, secret, { ignoreExpiration: true }) as any;
        const { id, role } = decoded.data || {};
        return jwt.sign(
            { data: { id, role } },
            secret,
            { expiresIn: '24h' }
        );
    } catch (err) {
        return null;
    }
} 