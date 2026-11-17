
import { Router } from "express";
import { validateDelivery } from "../middleware/validateDelivery";

import {
    getHome,
    getDeliveries,
    getDeliveryById,
    getAddDelivery,
    createDelivery
} from "../controllers/deliveryController";

const router = Router();

// Home route
router.get("/", getHome);

// Get all deliveries
router.get("/deliveries", getDeliveries);

// Get delivery by ID (route parameter)
router.get("/deliveries/:id", getDeliveryById);

// Show add delivery form
router.get("/add-delivery", getAddDelivery);

// Create new delivery
router.post("/deliveries", validateDelivery,createDelivery);

export default router;
