import type { Socket } from "socket.io";
import jwt from "jsonwebtoken";
import { db } from "../prisma/db.js";

interface SocketUser {
    id: number;
    name: string;
    email: string;
    role: "ADMIN" | "STAFF";
}

declare module "socket.io" {
    interface SocketData {
        user: SocketUser;
    }
}

export const socketAuth = async (
    socket: Socket,
    next: (error?: Error) => void
): Promise<void> => {
    try {
        // Get JWT from Socket.IO handshake
        const token = socket.handshake.auth.token;

        if (typeof token !== "string" || !token) {
            return next(new Error("Authentication token required."));
        }

        const jwtSecret = process.env.JWT_SECRET;

        if (!jwtSecret) {
            throw new Error("JWT_SECRET is not configured.");
        }

        // Verify JWT
        const decoded = jwt.verify(token, jwtSecret);

        if (
            typeof decoded === "string" ||
            typeof decoded.id !== "number"
        ) {
            return next(new Error("Invalid authentication token."));
        }

        // Check current user in PostgreSQL
        const user = await db.orm.public.User
            .whereUnique({ id: decoded.id })
            .first();

        if (!user || !user.isActive) {
            return next(new Error("User account is inactive."));
        }

        if (user.role !== "ADMIN" && user.role !== "STAFF") {
            return next(new Error("Invalid user role."));
        }

        // Store authenticated user information
        socket.data.user = {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role
        };

        next();

    } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            return next(new Error("JWT token expired."));
        }

        if (error instanceof jwt.JsonWebTokenError) {
            return next(new Error("Invalid JWT token."));
        }

        console.error("Socket authentication error:", error);
        next(new Error("Socket authentication failed."));
    }
};