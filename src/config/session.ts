import session from 'express-session';
import connectPgSimple from 'connect-pg-simple';
import { pool } from './pgDatabase.js';

const PostgreSQLStore = connectPgSimple(session);

export const sessionMiddleware = session({
    store: new PostgreSQLStore({
        pool,
        tableName: 'user_sessions',
        createTableIfMissing: true,
    }),

    secret: process.env.SESSION_SECRET || 'change-this-secret-before-production',

    resave: false,
    saveUninitialized: false,

    cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 1000 * 60 * 60 * 24,
    },
});