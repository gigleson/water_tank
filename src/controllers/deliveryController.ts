
import { Request, Response } from "express";
import { db } from "../prisma/db.js";
import { and, all } from "@prisma/orm-postgres/orm-client";

// Home page
export const getHome = (req: Request, res: Response): void => {
    res.render("index");
};

// Display all deliveries, with search and status filters
export const getDeliveries = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const status =
            typeof req.query.status === "string"
                ? req.query.status
                : "";

        const search =
            typeof req.query.search === "string"
                ? req.query.search.trim()
                : "";

        const deliveries = await db.orm.public.Delivery
            .where((d) =>
                and(
                    status ? d.status.eq(status) : all(),
                    search
                        ? d.customerName.ilike(`%${search}%`)
                        : all()
                )
            )
            .all();

        res.render("deliveries", {
            deliveries,
            status,
            search
        });
    } catch (error) {
        console.error("Error retrieving deliveries:", error);
        res.status(500).send("Failed to retrieve deliveries.");
    }
};

// Display one delivery
export const getDeliveryById = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            res.status(400).send("Invalid delivery ID.");
            return;
        }

        const delivery = await db.orm.public.Delivery
            .whereUnique({ id })
            .first();

        if (!delivery) {
            res.status(404).send("Delivery not found!");
            return;
        }

        res.render("delivery-details", { delivery });
    } catch (error) {
        console.error("Error retrieving delivery:", error);
        res.status(500).send("Failed to retrieve delivery.");
    }
};

// Display add-delivery page
export const getAddDelivery = (
    req: Request,
    res: Response
): void => {
    res.render("add-delivery");
};

// Create a new delivery
export const createDelivery = async (
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

        await db.orm.public.Delivery.create({
            customerName,
            address,
            phone,
            tankSize: Number(tankSize),
            quantity: Number(quantity),
            deliveryDate: new Date(deliveryDate),
            status: "Pending"
        });

        res.redirect("/deliveries");
    } catch (error) {
        console.error("Error creating delivery:", error);
        res.status(500).send("Failed to create delivery.");
    }
};

// Delete a delivery
export const deleteDelivery = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            res.status(400).send("Invalid delivery ID.");
            return;
        }

        const deletedDelivery = await db.orm.public.Delivery
            .where({ id })
            .delete();

        if (!deletedDelivery) {
            res.status(404).send("Delivery not found.");
            return;
        }

        res.redirect("/deliveries");
    } catch (error) {
        console.error("Error deleting delivery:", error);
        res.status(500).send("Failed to delete delivery.");
    }
};