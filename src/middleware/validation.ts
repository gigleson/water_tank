
import type { Request, Response, NextFunction } from "express";
import { body, validationResult } from "express-validator";

// Login validation
export const validateLogin = [
    body("email")
        .trim()
        .isEmail()
        .withMessage("Enter a valid email address.")
        .normalizeEmail(),

    body("password")
        .notEmpty()
        .withMessage("Password is required.")
];

// Staff account validation
export const validateUser = [
    body("name")
        .trim()
        .notEmpty()
        .withMessage("Name is required.")
        .isLength({ max: 100 })
        .withMessage("Name is too long."),

    body("email")
        .trim()
        .isEmail()
        .withMessage("Enter a valid email address.")
        .normalizeEmail(),

    body("password")
        .isLength({ min: 8 })
        .withMessage("Password must contain at least 8 characters.")
];


// Handle validation errors
export const handleValidationErrors = (
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        res.status(400).send(
            errors.array().map(error => error.msg).join(", ")
        );
        return;
    }

    next();
};
