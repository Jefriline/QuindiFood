import { Request } from 'express';

interface User {
    id: number;
    role: string;
}

export interface CustomRequest extends Request {
    user?: User;
} 