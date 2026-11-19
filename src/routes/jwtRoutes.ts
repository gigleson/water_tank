import { Router } from "express";
import { jwtLogin } from "../controllers/jwtAuthController.js";
import { requireJwtAuth } from "../middleware/jwtAuthMiddleware.js";
import { requireJwtRole } from "../middleware/jwtRoleMiddleware.js";
import {
    getApiDeliveries,
    getApiDeliveryById,createApiDelivery,
    updateApiDelivery,
    deleteApiDelivery,
    uploadDeliveryPaymentPhoto,
    getDeliveryPaymentPhoto
} from "../controllers/jwtDeliveryController.js";

import { paymentPhotoUpload } from "../middleware/uploadMiddleware.js";
import { validateDelivery } from "../middleware/validateDelivery.js";
import { generalLimiter, loginLimiter } from "../middleware/rateLimiter.js";
const router = Router();

// JWT login
router.post("/auth/login", loginLimiter,jwtLogin);

// Accessible to any authenticated user
router.get("/profile", requireJwtAuth, (req, res) => {
    res.status(200).json({
        message: "User profile retrieved successfully.",
        user: req.authUser
    });
});

// Accessible only to Admin
router.get(
    "/admin-only",
    requireJwtAuth,
    requireJwtRole("ADMIN"),
    (req, res) => {
        res.status(200).json({
            message: "Welcome, Admin."
        });
    }
);
// Protected delivery API
router.get(
    "/deliveries",
    requireJwtAuth,generalLimiter,
    getApiDeliveries
);

router.get(
    "/deliveries/:id",
    requireJwtAuth,
    getApiDeliveryById
);
router.post(
    "/deliveries",
    requireJwtAuth,validateDelivery,
    createApiDelivery
);
router.put(
    "/deliveries/:id",
    requireJwtAuth,
    updateApiDelivery
);
router.delete(
    "/deliveries/:id",
    requireJwtAuth,
    requireJwtRole("ADMIN"),
    deleteApiDelivery
);
// Upload payment photo
router.post(
    "/deliveries/:id/payment-photo",
    requireJwtAuth,
    paymentPhotoUpload,
    uploadDeliveryPaymentPhoto
);

// Retrieve payment photo
router.get(
    "/deliveries/:id/payment-photo",
    requireJwtAuth,
    getDeliveryPaymentPhoto
);

export default router;