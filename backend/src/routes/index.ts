import { Router } from "express";
import authRoutes from "./auth.routes";
import organizationRoutes from "./organization.routes";
import contractRoutes from "./contract.routes";
import extractionRoutes from "./extraction.routes";
import aiRoutes from "./ai.routes";
import taskRoutes from "./task.routes";
import notificationRoutes from "./notification.routes";
import playbookRoutes from "./playbook.routes";
import chatRoutes from "./chat.routes";
import commentRoutes from "./comment.routes";
import auditLogRoutes from "./auditLog.routes";
import searchRoutes from "./search.routes";
import reportRoutes from "./report.routes";
import metricsRoutes from "./metrics.routes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/organizations", organizationRoutes);
router.use("/contracts", contractRoutes);
router.use("/extraction", extractionRoutes);
router.use("/ai", aiRoutes);
router.use("/tasks", taskRoutes);
router.use("/notifications", notificationRoutes);
router.use("/playbook", playbookRoutes);
router.use("/chat", chatRoutes);
router.use("/comments", commentRoutes);
router.use("/audit-logs", auditLogRoutes);
router.use("/search", searchRoutes);
router.use("/reports", reportRoutes);
router.use("/metrics", metricsRoutes);

// Health check for API
router.get("/", (_req, res) => {
  res.json({
    success: true,
    message: "Clause-IQ API v1",
    version: "1.0.0",
  });
});

export default router;
