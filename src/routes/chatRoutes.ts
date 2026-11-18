import { Router } from "express";
import {
    sendMessage,
    getMessages
} from "../controllers/chatController.js";
import { requireJwtAuth } from "../middleware/jwtAuthMiddleware.js";
import { getConversations } from "../controllers/chatController.js";

const router = Router();

// Retrieve conversation messages
router.get("/:userId/messages", requireJwtAuth, getMessages);

// Send a message
router.post("/:receiverId/messages", requireJwtAuth, sendMessage);
router.get("/conversations", requireJwtAuth, getConversations);

export default router;