import { Router } from "express";
import {
    sendMessage,
    getMessages
} from "../controllers/chatController.js";
import { requireJwtAuth } from "../middleware/jwtAuthMiddleware.js";

const router = Router();

// Retrieve conversation messages
router.get("/:userId/messages", requireJwtAuth, getMessages);

// Send a message
router.post("/:receiverId/messages", requireJwtAuth, sendMessage);

export default router;