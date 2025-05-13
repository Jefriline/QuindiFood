import { Request } from 'express';

interface User {
    id: number;
    email: string;
    role: string;
    [key: string]: any;
}

export interface CustomRequest extends Request {
    user?: User;
} 