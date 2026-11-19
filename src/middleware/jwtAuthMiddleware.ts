
import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { db } from "../prisma/db.js";
import { ApiError } from "../utils/ApiError.js";

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
            throw new ApiError(
                401,
                "Authentication token is required."
            );
        }

        const token = authHeader.split(" ")[1];

        if (!token) {
            throw new ApiError(
                401,
                "Invalid authentication token."
            );
        }

        const jwtSecret = process.env.JWT_SECRET;

        if (!jwtSecret) {
            throw new Error("JWT_SECRET is not configured.");
        }

        const decoded = jwt.verify(token, jwtSecret);

        if (
            typeof decoded === "string" ||
            typeof decoded.id !== "number"
        ) {
            throw new ApiError(
                401,
                "Invalid token payload."
            );
        }

        // Check the current user in the database
        const user = await db.orm.public.User
            .whereUnique({ id: decoded.id })
            .first();

        if (!user) {
            throw new ApiError(
                401,
                "User account is unavailable."
            );
        }

        if (!user.isActive) {
            throw new ApiError(
                403,
                "Your account has been deactivated."
            );
        }

        if (user.role !== "ADMIN" && user.role !== "STAFF") {
            throw new ApiError(
                403,
                "You do not have a valid user role."
            );
        }

        req.authUser = {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role
        };

        next();

    } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            next(
                new ApiError(
                    401,
                    "Your token has expired. Please log in again."
                )
            );
            return;
        }

        if (error instanceof jwt.JsonWebTokenError) {
            next(
                new ApiError(
                    401,
                    "Invalid authentication token."
                )
            );
            return;
        }

        next(error);
    }
};
