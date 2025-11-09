import { Notification, NotificationType } from "../models";

class NotificationService {
  // Create a notification
  async createNotification(data: {
    type: NotificationType;
    title: string;
    message: string;
    userId: string;
    organizationId: string;
    contractId?: string;
    taskId?: string;
    actionUrl?: string;
    metadata?: Record<string, any>;
  }) {
    try {
      const notification = await Notification.create(data);
      console.log(`📬 Notification created for user ${data.userId}`);
      return notification;
    } catch (error) {
      console.error("❌ Failed to create notification:", error);
      throw error;
    }
  }

  // Create task assigned notification
  async createTaskAssignedNotification(
    userId: string,
    organizationId: string,
    taskId: string,
    contractId?: string
  ) {
    return this.createNotification({
      type: NotificationType.TASK_ASSIGNED,
      title: "New Task Assigned",
      message: "A new task has been assigned to you",
      userId,
      organizationId,
      taskId,
      contractId,
      actionUrl: `/tasks/${taskId}`,
    });
  }

  // Create task due soon notification
  async createTaskDueSoonNotification(
    userId: string,
    organizationId: string,
    taskId: string,
    taskTitle: string,
    dueDate: Date,
    contractId?: string
  ) {
    const daysUntilDue = Math.ceil(
      (dueDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    );
    return this.createNotification({
      type: NotificationType.TASK_DUE_SOON,
      title: "Task Due Soon",
      message: `Task "${taskTitle}" is due in ${daysUntilDue} day(s)`,
      userId,
      organizationId,
      taskId,
      contractId,
      actionUrl: `/tasks/${taskId}`,
      metadata: { daysUntilDue },
    });
  }

  // Create task overdue notification
  async createTaskOverdueNotification(
    userId: string,
    organizationId: string,
    taskId: string,
    taskTitle: string,
    contractId?: string
  ) {
    return this.createNotification({
      type: NotificationType.TASK_OVERDUE,
      title: "Task Overdue",
      message: `Task "${taskTitle}" is overdue`,
      userId,
      organizationId,
      taskId,
      contractId,
      actionUrl: `/tasks/${taskId}`,
    });
  }

  // Create extraction completed notification
  async createExtractionCompletedNotification(
    userId: string,
    organizationId: string,
    contractId: string,
    contractTitle: string
  ) {
    return this.createNotification({
      type: NotificationType.EXTRACTION_COMPLETED,
      title: "Text Extraction Complete",
      message: `Text extraction completed for "${contractTitle}"`,
      userId,
      organizationId,
      contractId,
      actionUrl: `/contracts/${contractId}`,
    });
  }

  // Create AI analysis completed notification
  async createAIAnalysisCompletedNotification(
    userId: string,
    organizationId: string,
    contractId: string,
    contractTitle: string
  ) {
    return this.createNotification({
      type: NotificationType.AI_ANALYSIS_COMPLETED,
      title: "AI Analysis Complete",
      message: `AI analysis completed for "${contractTitle}"`,
      userId,
      organizationId,
      contractId,
      actionUrl: `/contracts/${contractId}`,
    });
  }

  // Create risk detected notification
  async createRiskDetectedNotification(
    userId: string,
    organizationId: string,
    contractId: string,
    contractTitle: string,
    riskScore: number
  ) {
    return this.createNotification({
      type: NotificationType.RISK_DETECTED,
      title: "High Risk Detected",
      message: `High risk (${riskScore}) detected in "${contractTitle}"`,
      userId,
      organizationId,
      contractId,
      actionUrl: `/contracts/${contractId}`,
      metadata: { riskScore },
    });
  }

  // Create member invited notification
  async createMemberInvitedNotification(
    userId: string,
    organizationId: string,
    inviterEmail: string
  ) {
    return this.createNotification({
      type: NotificationType.MEMBER_INVITED,
      title: "Organization Invitation",
      message: `${inviterEmail} invited you to join their organization`,
      userId,
      organizationId,
      actionUrl: "/organization/settings",
    });
  }

  // Mark notification as read
  async markAsRead(notificationId: string, userId: string) {
    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, userId },
      { read: true, readAt: new Date() },
      { new: true }
    );
    return notification;
  }

  // Mark all notifications as read for a user
  async markAllAsRead(userId: string) {
    await Notification.updateMany(
      { userId, read: false },
      { read: true, readAt: new Date() }
    );
  }

  // Get unread count for user
  async getUnreadCount(userId: string) {
    return Notification.countDocuments({ userId, read: false });
  }

  // Delete old read notifications (cleanup)
  async deleteOldNotifications(daysOld = 30) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const result = await Notification.deleteMany({
      read: true,
      readAt: { $lt: cutoffDate },
    });

    console.log(`🧹 Deleted ${result.deletedCount} old notifications`);
    return result.deletedCount;
  }
}

export default new NotificationService();

