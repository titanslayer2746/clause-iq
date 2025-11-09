import { Router } from "express";
import { body, param, query } from "express-validator";
import {
  uploadContract,
  getContracts,
  getContractById,
  updateContract,
  deleteContract,
} from "../controllers/contract.controller";
import { validate } from "../middleware/validation";
import { authenticate, authorize } from "../middleware/auth";
import { upload, handleUploadError } from "../middleware/upload";
import { UserRole } from "../models";

const router = Router();

// All routes require authentication
router.use(authenticate);

// Upload contract
router.post(
  "/upload",
  upload.single("file"),
  handleUploadError,
  [
    body("title")
      .optional()
      .isLength({ min: 3, max: 200 })
      .withMessage("Title must be 3-200 characters"),
    body("vendor")
      .optional()
      .isLength({ max: 100 })
      .withMessage("Vendor name cannot exceed 100 characters"),
    body("description")
      .optional()
      .isLength({ max: 1000 })
      .withMessage("Description cannot exceed 1000 characters"),
  ],
  validate,
  uploadContract
);

// Get all contracts
router.get(
  "/",
  [
    query("status")
      .optional()
      .isString()
      .withMessage("Status must be a string"),
    query("search")
      .optional()
      .isString()
      .withMessage("Search must be a string"),
    query("page")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Page must be a positive integer"),
    query("limit")
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage("Limit must be between 1 and 100"),
  ],
  validate,
  getContracts
);

// Get contract by ID
router.get(
  "/:contractId",
  [param("contractId").isMongoId().withMessage("Invalid contract ID")],
  validate,
  getContractById
);

// Update contract
router.patch(
  "/:contractId",
  [
    param("contractId").isMongoId().withMessage("Invalid contract ID"),
    body("title")
      .optional()
      .isLength({ min: 3, max: 200 })
      .withMessage("Title must be 3-200 characters"),
    body("vendor")
      .optional()
      .isLength({ max: 100 })
      .withMessage("Vendor name cannot exceed 100 characters"),
    body("status")
      .optional()
      .isIn(["Pending", "Reviewed", "Approved", "Rejected", "Expired"])
      .withMessage("Invalid status"),
    body("tags").optional().isArray().withMessage("Tags must be an array"),
    body("metadata")
      .optional()
      .isObject()
      .withMessage("Metadata must be an object"),
  ],
  validate,
  updateContract
);

// Delete contract (Admin only)
router.delete(
  "/:contractId",
  authorize(UserRole.ADMIN),
  [param("contractId").isMongoId().withMessage("Invalid contract ID")],
  validate,
  deleteContract
);

export default router;
