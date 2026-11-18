import type { Request, Response } from "express";
import { db } from "../prisma/db.js";

// GET all deliveries
export const getApiDeliveries = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const deliveries = await db.orm.public.Delivery
            .select(
        "id",
        "customerName",
        "address",
        "phone",
        "tankSize",
        "quantity",
        "deliveryDate",
        "status",
        "createdAt",
        "updatedAt"
    )
    .all();

        res.status(200).json({
            message: "Deliveries retrieved successfully.",
            count: deliveries.length,
            deliveries
        });

    } catch (error) {
        console.error("API delivery error:", error);

        res.status(500).json({
            message: "Failed to retrieve deliveries."
        });
    }
};

// GET delivery by ID
export const getApiDeliveryById = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            res.status(400).json({
                message: "Invalid delivery ID."
            });
            return;
        }

        const delivery = await db.orm.public.Delivery
            .whereUnique({ id })
            .first();

        if (!delivery) {
            res.status(404).json({
                message: "Delivery not found."
            });
            return;
        }

        res.status(200).json({
            message: "Delivery retrieved successfully.",
            delivery
        });

    } catch (error) {
        console.error("API delivery error:", error);

        res.status(500).json({
            message: "Failed to retrieve delivery."
        });
    }
};
// Create a delivery through JWT API
export const createApiDelivery = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const {
            customerName,
            address,
            phone,
            tankSize,
            quantity,
            deliveryDate
        } = req.body;

        const newDelivery = await db.orm.public.Delivery.create({
            customerName,
            address,
            phone,
            tankSize: Number(tankSize),
            quantity: Number(quantity),
            deliveryDate: new Date(deliveryDate),
            status: "Pending"
        });

        res.status(201).json({
            message: "Delivery created successfully.",
            delivery: newDelivery
        });

    } catch (error) {
        console.error("API delivery creation error:", error);

        res.status(500).json({
            message: "Failed to create delivery."
        });
    }
};
// Update an existing delivery
export const updateApiDelivery = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            res.status(400).json({
                message: "Invalid delivery ID."
            });
            return;
        }

        const {
            customerName,
            address,
            phone,
            tankSize,
            quantity,
            deliveryDate,
            status
        } = req.body;

        const existingDelivery = await db.orm.public.Delivery
            .whereUnique({ id })
            .first();

        if (!existingDelivery) {
            res.status(404).json({
                message: "Delivery not found."
            });
            return;
        }

        const updatedDelivery = await db.orm.public.Delivery
            .where({ id })
            .update({
                customerName,
                address,
                phone,
                tankSize: Number(tankSize),
                quantity: Number(quantity),
                deliveryDate: new Date(deliveryDate),
                status
            });

        res.status(200).json({
            message: "Delivery updated successfully.",
            delivery: updatedDelivery
        });

    } catch (error) {
        console.error("API delivery update error:", error);

        res.status(500).json({
            message: "Failed to update delivery."
        });
    }
};

// Delete a delivery
export const deleteApiDelivery = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            res.status(400).json({
                message: "Invalid delivery ID."
            });
            return;
        }

        const deletedDelivery = await db.orm.public.Delivery
            .where({ id })
            .delete();

        if (!deletedDelivery) {
            res.status(404).json({
                message: "Delivery not found."
            });
            return;
        }

        res.status(200).json({
            message: "Delivery deleted successfully."
        });

    } catch (error) {
        console.error("API delivery deletion error:", error);

        res.status(500).json({
            message: "Failed to delete delivery."
        });
    }
};