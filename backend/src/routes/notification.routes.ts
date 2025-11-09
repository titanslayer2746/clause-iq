import { Router } from "express";
import { authenticate } from "../middleware/auth";
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} from "../controllers/notification.controller";

const router = Router();

// All routes require authentication
router.use(authenticate);

// Notification routes
router.get("/", getNotifications);
router.get("/unread-count", getUnreadCount);
router.patch("/:notificationId/read", markAsRead);
router.patch("/mark-all-read", markAllAsRead);
router.delete("/:notificationId", deleteNotification);

export default router;
