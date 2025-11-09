import { Router } from "express";
import { authenticate } from "../middleware/auth";
import {
  exportContractsCSV,
  exportTasksCSV,
  generateStatusReport,
  generateRiskReport,
  generateComplianceReport,
} from "../controllers/report.controller";

const router = Router();

// All routes require authentication
router.use(authenticate);

// Export routes
router.get("/export/contracts", exportContractsCSV);
router.get("/export/tasks", exportTasksCSV);

// PDF Report routes
router.get("/pdf/status", generateStatusReport);
router.get("/pdf/risk", generateRiskReport);
router.get("/pdf/compliance", generateComplianceReport);

export default router;

