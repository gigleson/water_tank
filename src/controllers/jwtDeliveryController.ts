import type { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/ApiError.js";
import { db } from "../prisma/db.js";
import { and, all } from "@prisma/orm-postgres/orm-client";
import fs from "fs/promises";
import path from "path";

// GET deliveries with pagination
// GET deliveries with pagination and filtering
export const getApiDeliveries = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        // Pagination
        const page = Math.max(1, Number(req.query.page) || 1);
        const limit = Math.min(
            100,
            Math.max(1, Number(req.query.limit) || 10)
        );
        const offset = (page - 1) * limit;

        // Filtering
        const status =
            typeof req.query.status === "string"
                ? req.query.status.trim()
                : "";

        const search =
            typeof req.query.search === "string"
                ? req.query.search.trim()
                : "";

        const tankSize =
            typeof req.query.tankSize === "string"
                ? Number(req.query.tankSize)
                : undefined;

        if (
            tankSize !== undefined &&
            ![500, 1000, 2000].includes(tankSize)
        ) {
            res.status(400).json({
                message: "Invalid tank size. Choose 500, 1000 or 2000."
            });
            return;
        }

        // Count matching deliveries
        const countResult = await db.orm.public.Delivery
            .where((d) =>
                and(
                    status ? d.status.eq(status) : all(),
                    search
                        ? d.customerName.ilike(`%${search}%`)
                        : all(),
                    tankSize !== undefined
                        ? d.tankSize.eq(tankSize)
                        : all()
                )
            )
            .aggregate((a) => ({
                total: a.count()
            }));

        // Retrieve matching deliveries
        const deliveries = await db.orm.public.Delivery
            .where((d) =>
                and(
                    status ? d.status.eq(status) : all(),
                    search
                        ? d.customerName.ilike(`%${search}%`)
                        : all(),
                    tankSize !== undefined
                        ? d.tankSize.eq(tankSize)
                        : all()
                )
            )
            .orderBy([
                (d) => d.createdAt.desc(),
                (d) => d.id.desc()
            ])
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
            .limit(limit)
            .offset(offset)
            .all();

        const total = Number(countResult.total);

        res.status(200).json({
            message: "Deliveries retrieved successfully.",
            filters: {
                status: status || null,
                search: search || null,
                tankSize: tankSize ?? null
            },
            pagination: {
                currentPage: page,
                limit,
                totalRecords: total,
                totalPages: Math.ceil(total / limit),
                hasNextPage: page * limit < total,
                hasPreviousPage: page > 1
            },
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
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            throw new ApiError(400, "Invalid delivery ID.");
        }

        const delivery = await db.orm.public.Delivery
            .whereUnique({ id })
            .first();

        if (!delivery) {
            throw new ApiError(404, "Delivery not found.");
        }

        res.status(200).json({
            success: true,
            message: "Delivery retrieved successfully.",
            delivery
        });

    } catch (error) {
        next(error);
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



// Upload payment photo
export const uploadDeliveryPaymentPhoto = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    let uploadedFilePath: string | undefined;

    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            throw new ApiError(400, "Invalid delivery ID.");
        }

        if (!req.file) {
            throw new ApiError(400, "Payment photo is required.");
        }

        uploadedFilePath = req.file.path;

        const delivery = await db.orm.public.Delivery
            .whereUnique({ id })
            .first();

        if (!delivery) {
            throw new ApiError(404, "Delivery not found.");
        }

        if (delivery.paymentPhotoPath) {
            throw new ApiError(
                409,
                "A payment photo already exists for this delivery."
            );
        }

        const relativePath = path.posix.join(
            "uploads",
            "payment-photos",
            req.file.filename
        );

        await db.orm.public.Delivery
            .where({ id })
            .update({
                paymentPhotoPath: relativePath
            });

        res.status(201).json({
            message: "Payment photo uploaded successfully.",
            deliveryId: id
        });

    } catch (error) {
        if (uploadedFilePath) {
            await fs.unlink(uploadedFilePath).catch(() => {});
        }

        next(error);
    }
};
export const getDeliveryPaymentPhoto = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            throw new ApiError(400, "Invalid delivery ID.");
        }

        const delivery = await db.orm.public.Delivery
            .whereUnique({ id })
            .first();

        if (!delivery) {
            throw new ApiError(404, "Delivery not found.");
        }

        if (!delivery.paymentPhotoPath) {
            throw new ApiError(
                404,
                "No payment photo found for this delivery."
            );
        }

        const uploadDirectory = path.resolve(
            process.cwd(),
            "uploads",
            "payment-photos"
        );

        const filePath = path.resolve(
            process.cwd(),
            delivery.paymentPhotoPath
        );

        if (!filePath.startsWith(uploadDirectory + path.sep)) {
            throw new ApiError(400, "Invalid payment photo path.");
        }

        await fs.access(filePath);

        res.setHeader("Cache-Control", "private, no-store");
        res.sendFile(filePath, (error) => {
            if (error && !res.headersSent) {
                next(error);
            }
        });

    } catch (error) {
        if ((error as NodeJS.ErrnoException).code === "ENOENT") {
            next(new ApiError(404, "Payment photo file not found."));
            return;
        }

        next(error);
    }
};