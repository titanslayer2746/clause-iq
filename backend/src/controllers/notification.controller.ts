import { Response } from "express";
import Notification from "../models/Notification";
import { AuthRequest } from "../types";
import { AppError, asyncHandler } from "../middleware/errorHandler";
import { sendSuccess } from "../utils/response";

// Get all notifications for current user
export const getNotifications = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const user = req.user!;
    const { read, page = 1, limit = 20 } = req.query;

    const filter: any = { userId: user._id };
    if (read !== undefined) {
      filter.read = read === "true";
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [notifications, total, unreadCount] = await Promise.all([
      Notification.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .populate("relatedContractId", "title")
        .populate("relatedTaskId", "title"),
      Notification.countDocuments(filter),
      Notification.countDocuments({ userId: user._id, read: false }),
    ]);

    sendSuccess(res, {
      notifications,
      unreadCount,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / Number(limit)),
      },
    });
  }
);

// Get unread count
export const getUnreadCount = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const user = req.user!;

    const unreadCount = await Notification.countDocuments({
      userId: user._id,
      read: false,
    });

    sendSuccess(res, { unreadCount });
  }
);

// Mark notification as read
export const markAsRead = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const user = req.user!;
    const { notificationId } = req.params;

    const notification = await Notification.findOne({
      _id: notificationId,
      userId: user._id,
    });

    if (!notification) {
      throw new AppError("Notification not found", 404);
    }

    notification.read = true;
    notification.readAt = new Date();
    await notification.save();

    sendSuccess(res, { notification }, "Notification marked as read");
  }
);

// Mark all notifications as read
export const markAllAsRead = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const user = req.user!;

    const result = await Notification.updateMany(
      { userId: user._id, read: false },
      { read: true, readAt: new Date() }
    );

    sendSuccess(
      res,
      { modifiedCount: result.modifiedCount },
      "All notifications marked as read"
    );
  }
);

// Delete notification
export const deleteNotification = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const user = req.user!;
    const { notificationId } = req.params;

    const notification = await Notification.findOne({
      _id: notificationId,
      userId: user._id,
    });

    if (!notification) {
      throw new AppError("Notification not found", 404);
    }

    await notification.deleteOne();

    sendSuccess(res, null, "Notification deleted successfully");
  }
);

// Create notification (internal use)
export const createNotification = async (data: {
  userId: string;
  organizationId: string;
  type: string;
  title: string;
  message: string;
  relatedContractId?: string;
  relatedTaskId?: string;
  link?: string;
  metadata?: any;
}) => {
  try {
    const notification = await Notification.create(data);
    console.log(`✅ Created notification for user ${data.userId}: ${data.title}`);
    return notification;
  } catch (error) {
    console.error("❌ Failed to create notification:", error);
    throw error;
  }
};
