
import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { db } from "../prisma/db.js";

export const jwtLogin = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const { email, password } = req.body;

        // 1. Validate input
        if (!email || !password) {
            res.status(400).json({
                message: "Email and password are required."
            });
            return;
        }

        // 2. Find user in the database
        const user = await db.orm.public.User
            .where({ email })
            .first();

        if (!user) {
            res.status(401).json({
                message: "Invalid email or password."
            });
            return;
        }

        // 3. Check whether account is active
        if (!user.isActive) {
            res.status(403).json({
                message: "Your account has been deactivated."
            });
            return;
        }

        // 4. Verify password
        const passwordMatches = await bcrypt.compare(
            password,
            user.passwordHash
        );

        if (!passwordMatches) {
            res.status(401).json({
                message: "Invalid email or password."
            });
            return;
        }

        // 5. Check JWT secret
        const jwtSecret = process.env.JWT_SECRET;

        if (!jwtSecret) {
            throw new Error("JWT_SECRET is not configured.");
        }

        // 6. Generate JWT token
        const token = jwt.sign(
            {
                id: user.id,
                role: user.role,
                email: user.email
            },
            jwtSecret,
            {
                expiresIn: "15m"
            }
        );

        // 7. Return token
        res.status(200).json({
            message: "Login successful.",
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        console.error("JWT login error:", error);

        res.status(500).json({
            message: "Internal server error."
        });
    }
};
