import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth";
import { UserRole } from "../models";
import {
  getRules,
  createRule,
  updateRule,
  deleteRule,
  runComplianceCheck,
  getComplianceResult,
  getComplianceStats,
} from "../controllers/playbook.controller";

const router = Router();

// All routes require authentication
router.use(authenticate);

// Playbook rules (Admin only for modifications)
router.get("/rules", getRules);
router.get("/stats", getComplianceStats);
router.post("/rules", authorize(UserRole.ADMIN), createRule);
router.patch("/rules/:ruleId", authorize(UserRole.ADMIN), updateRule);
router.delete("/rules/:ruleId", authorize(UserRole.ADMIN), deleteRule);

// Compliance checks (any authenticated user can run)
router.post("/contracts/:contractId/check", runComplianceCheck);
router.get("/contracts/:contractId/result", getComplianceResult);

export default router;

