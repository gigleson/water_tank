
import { Request, Response } from "express";
import { deliveries } from "../data/deliveries";

// Home page
export const getHome = (req: Request, res: Response): void => {
    res.render("index");
};

// Display all deliveries

export const getDeliveries = (req: Request, res: Response): void => {
    const { status, search } = req.query;

    let filteredDeliveries = [...deliveries];

    // Filter only when status has a value
    if (typeof status === "string" && status.trim() !== "") {
        filteredDeliveries = filteredDeliveries.filter(
            delivery =>
                delivery.status.toLowerCase() === status.trim().toLowerCase()
        );
    }

    // Search only when search has a value
    if (typeof search === "string" && search.trim() !== "") {
        filteredDeliveries = filteredDeliveries.filter(
            delivery =>
                delivery.customerName.toLowerCase().includes(search.trim().toLowerCase())
        );
    }

    res.render("deliveries", {
        deliveries: filteredDeliveries,
        status: status || "",
        search: search || ""
    });
};


// Display one delivery using route parameter
export const getDeliveryById = (req: Request, res: Response): void => {
    const id = Number(req.params.id);

    const delivery = deliveries.find(item => item.id === id);

    if (!delivery) {
        res.status(404).send("Delivery not found!");
        return;
    }

    res.render("delivery-details", { delivery });
};

// Show add delivery form
export const getAddDelivery = (req: Request, res: Response): void => {
    res.render("add-delivery");
};

// Add new delivery
export const createDelivery = (req: Request, res: Response): void => {
    const {
        customerName,
        address,
        phone,
        tankSize,
        quantity,
        deliveryDate
    } = req.body;

    const newDelivery = {
        id: deliveries.length > 0
            ? Math.max(...deliveries.map(d => d.id)) + 1
            : 1,
        customerName,
        address,
        phone,
        tankSize: Number(tankSize),
        quantity: Number(quantity),
        deliveryDate,
        status: "Pending" as const
    };

    deliveries.push(newDelivery);

    res.redirect("/deliveries");
};
