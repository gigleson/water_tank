
import { Request, Response, NextFunction } from "express";

export const validateDelivery = (
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    const {
        customerName,
        address,
        phone,
        tankSize,
        quantity,
        deliveryDate
    } = req.body;

    if (
        !customerName?.trim() ||
        !address?.trim() ||
        !phone?.trim() ||
        !tankSize ||
        !quantity ||
        !deliveryDate
    ) {
        res.status(400).send("Please fill in all required fields.");
        return;
    }

    if (
        !/^\d{10}$/.test(phone) ||
        ![500, 1000, 2000].includes(Number(tankSize)) ||
        !Number.isInteger(Number(quantity)) ||
        Number(quantity) < 1 ||
        Number(quantity) > 100
    ) {
        res.status(400).send("Invalid delivery information.");
        return;
    }

    next();
};
