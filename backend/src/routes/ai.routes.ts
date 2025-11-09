import { Router } from "express";
import { param } from "express-validator";
import {
  runAIExtraction,
  getAIExtraction,
  runRiskAnalysis,
} from "../controllers/ai.controller";
import { validate } from "../middleware/validation";
import { authenticate } from "../middleware/auth";
import { aiLimiter } from "../middleware/rateLimiter";

const router = Router();

// All routes require authentication
router.use(authenticate);

// Run AI extraction on contract (rate limited)
router.post(
  "/contracts/:contractId/extract",
  aiLimiter,
  [param("contractId").isMongoId().withMessage("Invalid contract ID")],
  validate,
  runAIExtraction
);

// Get AI extraction results
router.get(
  "/contracts/:contractId/extraction",
  [param("contractId").isMongoId().withMessage("Invalid contract ID")],
  validate,
  getAIExtraction
);

// Run risk analysis (rate limited)
router.post(
  "/contracts/:contractId/risks",
  aiLimiter,
  [param("contractId").isMongoId().withMessage("Invalid contract ID")],
  validate,
  runRiskAnalysis
);

export default router;
