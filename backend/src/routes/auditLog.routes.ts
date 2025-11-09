import { Router } from "express";
import { authenticate } from "../middleware/auth";
import {
  getAuditLogs,
  getContractAuditLogs,
} from "../controllers/auditLog.controller";

const router = Router();

// All routes require authentication
router.use(authenticate);

// Audit log routes
router.get("/", getAuditLogs);
router.get("/contracts/:contractId", getContractAuditLogs);

export default router;

