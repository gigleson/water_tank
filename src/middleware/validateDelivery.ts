
import { body, validationResult } from "express-validator";
import type { Request, Response, NextFunction } from "express";

export const validateDelivery = [
    body("customerName")
        .trim()
        .notEmpty()
        .withMessage("Customer name is required."),

    body("address")
        .trim()
        .notEmpty()
        .withMessage("Address is required."),

    body("phone")
        .trim()
        .matches(/^\d{10}$/)
        .withMessage("Phone number must contain exactly 10 digits."),

    body("tankSize")
        .isInt()
        .withMessage("Invalid tank size.")
        .bail()
        .custom(value => [500, 1000, 2000].includes(Number(value)))
        .withMessage("Choose a valid tank size."),

    body("quantity")
        .isInt({ min: 1, max: 100 })
        .withMessage("Quantity must be between 1 and 100."),

    body("deliveryDate")
        .isISO8601()
        .withMessage("Enter a valid delivery date."),

    (req: Request, res: Response, next: NextFunction): void => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            const formattedErrors = errors.array().map(error => ({
                field: error.type === "field" ? error.path : "request",
                message: error.msg
            }));

            res.status(400).json({
                success: false,
                message: "Validation failed.",
                errors: formattedErrors
            });

            return;
        }

        next();
    }
];
