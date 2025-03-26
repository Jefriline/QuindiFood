import { Pool } from 'pg';
import dotenv from "dotenv";
dotenv.config();

const db = new Pool({
    host: process.env.DB_HOST,
    user: process.env.DB_USERNAME,
    port: parseInt(process.env.DB_PORT || '5432'),
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});

export default db;