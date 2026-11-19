
import type { Request, Response, NextFunction } from "express";

export const errorHandler = (
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    console.error("Error:", err);

    // If the response has already started, pass the error to Express.
    if (res.headersSent) {
        next(err);
        return;
    }

    // Handle API errors separately
    if (req.originalUrl.startsWith("/api/")) {
        const statusCode =
            "statusCode" in err &&
            typeof err.statusCode === "number"
                ? err.statusCode
                : 500;

        const message =
            statusCode >= 500
                ? "Internal server error."
                : err.message;

        res.status(statusCode).json({
            success: false,
            message,
            errors: null
        });

        return;
    }

    // Handle regular web application errors
    res.status(500).send("Something went wrong!");
};
