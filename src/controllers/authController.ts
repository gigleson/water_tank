import type { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { pool } from '../config/pgDatabase.js';

interface UserRow {
    id: number;
    name: string;
    email: string;
    passwordHash: string;
    role: string;
    isActive: boolean;
}

// Display login page
export const getLogin = (req: Request, res: Response): void => {
    if (req.session.user) {
        res.redirect('/deliveries');
        return;
    }

    res.render('login', { error: null });
};

// Process login
export const postLogin = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const email = String(req.body.email || '').trim().toLowerCase();
        const password = String(req.body.password || '');

        if (!email || !password) {
            res.status(400).render('login', {
                error: 'Please enter your email and password.',
            });
            return;
        }

        const result = await pool.query<UserRow>(
            `SELECT id, name, email, "passwordHash", role, "isActive"
             FROM users
             WHERE email = $1`,
            [email]
        );

        const user = result.rows[0];

        if (
            !user ||
            !user.isActive ||
            !['ADMIN', 'STAFF'].includes(user.role)
        ) {
            res.status(401).render('login', {
                error: 'Invalid email or password.',
            });
            return;
        }

        const passwordMatches = await bcrypt.compare(
            password,
            user.passwordHash
        );

        if (!passwordMatches) {
            res.status(401).render('login', {
                error: 'Invalid email or password.',
            });
            return;
        }

        // Regenerate session after successful login
        await new Promise<void>((resolve, reject) => {
            req.session.regenerate((error) => {
                if (error) reject(error);
                else resolve();
            });
        });

        req.session.user = {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role as 'ADMIN' | 'STAFF',
        };

        await new Promise<void>((resolve, reject) => {
            req.session.save((error) => {
                if (error) reject(error);
                else resolve();
            });
        });

        res.redirect('/deliveries');
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).render('login', {
            error: 'Something went wrong. Please try again.',
        });
    }
};

// Logout
export const logout = (
    req: Request,
    res: Response
): void => {
    req.session.destroy((error) => {
        if (error) {
            console.error('Logout error:', error);
            res.status(500).send('Unable to log out.');
            return;
        }

        res.clearCookie('connect.sid');
        res.redirect('/login');
    });
};