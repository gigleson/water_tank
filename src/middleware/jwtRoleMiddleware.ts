
import type { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/ApiError.js";

export const requireJwtRole = (
    ...allowedRoles: ("ADMIN" | "STAFF")[]
) => {
    return (
        req: Request,
        _res: Response,
        next: NextFunction
    ): void => {

        // Check authentication
        if (!req.authUser) {
            next(new ApiError(401, "Authentication required."));
            return;
        }

        // Check authorization
        if (!allowedRoles.includes(req.authUser.role)) {
            next(
                new ApiError(
                    403,
                    "Access denied. You do not have permission."
                )
            );
            return;
        }

        next();
    };
};
