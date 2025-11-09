import { Router } from "express";
import { param } from "express-validator";
import {
  runAIAnalysis,
  getExtractionStatus,
} from "../controllers/extraction.controller";
import { validate } from "../middleware/validation";
import { authenticate } from "../middleware/auth";

const router = Router();

// All routes require authentication
router.use(authenticate);

// Run AI Analysis on extracted text (new flow - replaces extract)
router.post(
  "/contracts/:contractId/ai-analysis",
  [param("contractId").isMongoId().withMessage("Invalid contract ID")],
  validate,
  runAIAnalysis
);

// Get extraction status and AI analysis progress
router.get(
  "/contracts/:contractId/extraction",
  [param("contractId").isMongoId().withMessage("Invalid contract ID")],
  validate,
  getExtractionStatus
);

export default router;
