import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth";
import { UserRole } from "../models";
import { getUsageMetrics, getAdminMetrics } from "../controllers/metrics.controller";

const router = Router();

// All routes require authentication
router.use(authenticate);

// Metrics routes
router.get("/usage", getUsageMetrics);
router.get("/admin", authorize(UserRole.ADMIN), getAdminMetrics);

export default router;

