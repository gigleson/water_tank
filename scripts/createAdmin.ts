
import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { pool } from '../src/config/pgDatabase.js';
import { createInterface } from 'node:readline/promises';
import { stdin, stdout } from 'node:process';

const rl = createInterface({ input: stdin, output: stdout });

async function createAdmin(): Promise<void> {
    try {
        const name = (await rl.question('Admin name: ')).trim();
        const email = (await rl.question('Admin email: ')).trim().toLowerCase();
        const password = await rl.question('Admin password: ');

        if (!name || !email || password.length < 8) {
            console.log('Enter a name, valid email, and password of at least 8 characters.');
            return;
        }

        const passwordHash = await bcrypt.hash(password, 12);

       const result = await pool.query(
    `INSERT INTO users
        ("name", "email", "passwordHash", "role", "isActive", "updatedAt")
     VALUES ($1, $2, $3, 'ADMIN', true, NOW())
     ON CONFLICT ("email") DO NOTHING
     RETURNING id, name, email, role`,
    [name, email, passwordHash]
);

        if (result.rowCount === 0) {
            console.log('An account with this email already exists.');
        } else {
            console.log('Admin account created successfully!');
            console.log(result.rows[0]);
        }
    } catch (error) {
        console.error('Failed to create Admin:', error);
    } finally {
        rl.close();
        await pool.end();
    }
}

createAdmin();
