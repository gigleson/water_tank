import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { db } from "../prisma/db.js";

export interface JwtPayload {
    id: number;
    name: string;
    role: "ADMIN" | "STAFF";
    email: string;
}

declare global {
    namespace Express {
        interface Request {
            authUser?: JwtPayload;
        }
    }
}

export const requireJwtAuth = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader?.startsWith("Bearer ")) {
            res.status(401).json({
                message: "Authentication token is required."
            });
            return;
        }

        const token = authHeader.split(" ")[1];
        const jwtSecret = process.env.JWT_SECRET;

        if (!token || !jwtSecret) {
            res.status(401).json({
                message: "Invalid authentication token."
            });
            return;
        }

        const decoded = jwt.verify(token, jwtSecret);

        if (
            typeof decoded === "string" ||
            typeof decoded.id !== "number"
        ) {
            res.status(401).json({
                message: "Invalid token payload."
            });
            return;
        }

        // Check the current user in the database
        const user = await db.orm.public.User
            .whereUnique({ id: decoded.id })
            .first();

        if (!user || !user.isActive) {
            res.status(401).json({
                message: "User account is inactive or unavailable."
            });
            return;
        }

        if (user.role !== "ADMIN" && user.role !== "STAFF") {
            res.status(403).json({
                message: "Invalid user role."
            });
            return;
        }

        // Use the current database information
        req.authUser = {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role
        };

        next();

    } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            res.status(401).json({
                message: "Your token has expired. Please log in again."
            });
            return;
        }

        if (error instanceof jwt.JsonWebTokenError) {
            res.status(401).json({
                message: "Invalid authentication token."
            });
            return;
        }

        console.error("JWT authentication error:", error);

        res.status(500).json({
            message: "Internal server error."
        });
    }
};