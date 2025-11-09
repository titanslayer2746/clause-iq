import cron from "node-cron";
import { Task } from "../models";

class SchedulerService {
  private jobs: cron.ScheduledTask[] = [];

  // Initialize all scheduled jobs
  initialize() {
    console.log("🕐 Initializing scheduler service...");

    // Check for due tasks every day at 9:00 AM
    const dueSoonJob = cron.schedule("0 9 * * *", () => {
      this.checkDueSoonTasks();
    });
    this.jobs.push(dueSoonJob);

    // Check for overdue tasks every day at 10:00 AM
    const overdueJob = cron.schedule("0 10 * * *", () => {
      this.checkOverdueTasks();
    });
    this.jobs.push(overdueJob);

    console.log("✅ Scheduler service initialized with 2 jobs");
  }

  // Check for tasks due within 3 days
  async checkDueSoonTasks() {
    try {
      console.log("🔍 Checking for tasks due soon...");

      const today = new Date();
      const threeDaysFromNow = new Date();
      threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);

      const dueSoonTasks = await Task.find({
        status: { $in: ["pending", "in_progress"] },
        dueDate: { $gte: today, $lte: threeDaysFromNow },
      }).populate("assignedTo contractId");

      console.log(`📋 Found ${dueSoonTasks.length} tasks due soon`);

      for (const task of dueSoonTasks) {
        if (task.assignedTo) {
          console.log(
            `⏰ Task "${task.title}" due on ${task.dueDate.toISOString()} assigned to ${
              (task.assignedTo as any).email
            }`
          );
          // TODO: Send email notification when email service is configured
          // await emailService.sendTaskReminderEmail(...)
        }
      }

      console.log(`✅ Checked ${dueSoonTasks.length} tasks due soon`);
    } catch (error) {
      console.error("❌ Error checking due soon tasks:", error);
    }
  }

  // Check for overdue tasks
  async checkOverdueTasks() {
    try {
      console.log("🔍 Checking for overdue tasks...");

      const today = new Date();

      const overdueTasks = await Task.find({
        status: { $in: ["pending", "in_progress"] },
        dueDate: { $lt: today },
      }).populate("assignedTo contractId");

      console.log(`⚠️ Found ${overdueTasks.length} overdue tasks`);

      for (const task of overdueTasks) {
        if (task.assignedTo) {
          console.log(
            `🚨 OVERDUE: Task "${task.title}" was due on ${task.dueDate.toISOString()} assigned to ${
              (task.assignedTo as any).email
            }`
          );
          // TODO: Send email notification when email service is configured
          // await emailService.sendOverdueTaskEmail(...)
        }
      }

      console.log(`✅ Checked ${overdueTasks.length} overdue tasks`);
    } catch (error) {
      console.error("❌ Error checking overdue tasks:", error);
    }
  }

  // Stop all scheduled jobs
  stop() {
    console.log("🛑 Stopping scheduler service...");
    this.jobs.forEach((job) => job.stop());
    this.jobs = [];
    console.log("✅ Scheduler service stopped");
  }

  // Get job status
  getStatus() {
    return {
      running: this.jobs.length > 0,
      jobCount: this.jobs.length,
    };
  }
}

export default new SchedulerService();

