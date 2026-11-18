
import { Router } from "express";
import {
    validateUser,
    handleValidationErrors
} from "../middleware/validation.js";
import {
    getUsers,
    getAddUser,
    createUser,toggleUserStatus
} from "../controllers/userController.js";
import { requireAuth } from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/roleMiddleware.js";

const router = Router();

router.use(requireAuth);
router.use(requireRole("ADMIN"));

router.get("/admin/users", getUsers);
router.get("/admin/users/add", getAddUser);
router.post("/admin/users",validateUser,
    handleValidationErrors, createUser);
router.post("/admin/users/:id/toggle-status", toggleUserStatus);
export default router;
