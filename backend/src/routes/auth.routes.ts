import { Router } from "express";
import { body } from "express-validator";
import {
  signup,
  verifyOTP,
  login,
  inviteTeamMember,
  acceptInvitation,
  validateInvitation,
  resendOTP,
} from "../controllers/auth.controller";
import { validate } from "../middleware/validation";
import { authenticate, authorize } from "../middleware/auth";
import { UserRole } from "../models";
import { authLimiter } from "../middleware/rateLimiter";

const router = Router();

// Public routes
router.post(
  "/signup",
  [
    body("email")
      .isEmail()
      .normalizeEmail()
      .withMessage("Valid email required"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
    body("organizationName")
      .isLength({ min: 2, max: 100 })
      .withMessage("Organization name must be 2-100 characters"),
  ],
  validate,
  signup
);

router.post(
  "/verify-otp",
  [
    body("email")
      .isEmail()
      .normalizeEmail()
      .withMessage("Valid email required"),
    body("otp")
      .isLength({ min: 6, max: 6 })
      .withMessage("OTP must be 6 digits"),
  ],
  validate,
  verifyOTP
);

router.post(
  "/resend-otp",
  [
    body("email")
      .isEmail()
      .normalizeEmail()
      .withMessage("Valid email required"),
  ],
  validate,
  resendOTP
);

router.post(
  "/login",
  authLimiter,
  [
    body("email")
      .isEmail()
      .normalizeEmail()
      .withMessage("Valid email required"),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  validate,
  login
);

router.get("/validate-invitation", validateInvitation);

router.post(
  "/accept-invitation",
  [
    body("token").notEmpty().withMessage("Invitation token is required"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
  ],
  validate,
  acceptInvitation
);

// Protected routes
router.post(
  "/invite",
  authenticate,
  authorize(UserRole.ADMIN),
  [
    body("email")
      .isEmail()
      .normalizeEmail()
      .withMessage("Valid email required"),
    body("role")
      .isIn(Object.values(UserRole))
      .withMessage("Valid role required"),
  ],
  validate,
  inviteTeamMember
);

export default router;
