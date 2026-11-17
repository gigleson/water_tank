
import { Router } from "express";
import { validateDelivery } from "../middleware/validateDelivery";
import { requireAuth } from '../middleware/authMiddleware.js';

import {
    getHome,
    getDeliveries,
    getDeliveryById,
    getAddDelivery,
    createDelivery,
    deleteDelivery
} from "../controllers/deliveryController";
import { requireRole } from "../middleware/roleMiddleware";

const router = Router();
router.use(requireAuth);

// Home route
router.get("/", getHome);

// Get all deliveries
router.get("/deliveries",  requireRole('ADMIN'),getDeliveries);

// Get delivery by ID (route parameter)
router.get("/deliveries/:id", getDeliveryById);

// Show add delivery form
router.get("/add-delivery", getAddDelivery);

// Create new delivery
router.post("/deliveries", validateDelivery,createDelivery);

router.post(
    "/deliveries/:id/delete",
    requireRole("ADMIN"),
    deleteDelivery
);

export default router;
