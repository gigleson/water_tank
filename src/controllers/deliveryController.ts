
import { Request, Response } from "express";
import mongoose from "mongoose";
import DeliveryModel from "../models/mongodb_delivery";

// Home page
export const getHome = (req: Request, res: Response): void => {
    res.render("index");
};

// Display all deliveries and search
export const getDeliveries = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const { status, search } = req.query;

        const filter: Record<string, any> = {};

        if (typeof status === "string" && status.trim()) {
            filter.status = status;
        }

        if (typeof search === "string" && search.trim()) {
            filter.customerName = {
                $regex: search.trim(),
                $options: "i"
            };
        }

        const deliveries = await DeliveryModel.find(filter);

        res.render("deliveries", {
            deliveries,
            status: status || "",
            search: search || ""
        });

    } catch (error) {
        res.status(500).send("Failed to retrieve deliveries.");
    }
};

// Display delivery by MongoDB ID
export const getDeliveryById = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const id = req.params.id;

        if (!mongoose.isValidObjectId(id)) {
            res.status(400).send("Invalid delivery ID.");
            return;
        }

        const delivery = await DeliveryModel.findById(id);

        if (!delivery) {
            res.status(404).send("Delivery not found!");
            return;
        }

        res.render("delivery-details", { delivery });

    } catch (error) {
        res.status(500).send("Failed to retrieve delivery.");
    }
};

// Show add delivery form
export const getAddDelivery = (
    req: Request,
    res: Response
): void => {
    res.render("add-delivery");
};

// Create new delivery
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

        const newDelivery = await DeliveryModel.create({
            customerName,
            address,
            phone,
            tankSize: Number(tankSize),
            quantity: Number(quantity),
            deliveryDate,
            status: "Pending"
        });

        console.log("New delivery saved:", newDelivery._id);

        res.redirect("/deliveries");

    } catch (error) {
        console.error(error);
        res.status(500).send("Failed to create delivery.");
    }
};
