import type { Request, Response, NextFunction } from "express";

export const requireJwtRole = (
    ...allowedRoles: ("ADMIN" | "STAFF")[]
) => {
    return (
        req: Request,
        res: Response,
        next: NextFunction
    ): void => {

        if (!req.authUser) {
            res.status(401).json({
                message: "Authentication required."
            });
            return;
        }

        if (!allowedRoles.includes(req.authUser.role)) {
            res.status(403).json({
                message: "Access denied. You do not have permission."
            });
            return;
        }

        next();
    };
};