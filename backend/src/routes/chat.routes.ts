import { Router } from "express";
import { authenticate } from "../middleware/auth";
import {
  askQuestion,
  getChatHistory,
  deleteChatMessage,
  clearChatHistory,
} from "../controllers/chat.controller";

const router = Router();

// All routes require authentication
router.use(authenticate);

// Chat routes
router.post("/contracts/:contractId/ask", askQuestion);
router.get("/contracts/:contractId/history", getChatHistory);
router.delete("/messages/:messageId", deleteChatMessage);
router.delete("/contracts/:contractId/clear", clearChatHistory);

export default router;

