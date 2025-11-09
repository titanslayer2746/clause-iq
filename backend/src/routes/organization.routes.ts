import { Router } from "express";
import { body, param } from "express-validator";
import {
  getCurrentOrganization,
  updateOrganization,
  getOrganizationMembers,
  getPendingInvitations,
  cancelInvitation,
  removeMember,
  updateMemberRole,
} from "../controllers/organization.controller";
import { validate } from "../middleware/validation";
import { authenticate, authorize } from "../middleware/auth";
import { UserRole } from "../models";

const router = Router();

// All routes require authentication
router.use(authenticate);

// Get current organization
router.get("/current", getCurrentOrganization);

// Update organization (Admin only)
router.patch(
  "/current",
  authorize(UserRole.ADMIN),
  [
    body("name")
      .optional()
      .isLength({ min: 2, max: 100 })
      .withMessage("Organization name must be 2-100 characters"),
    body("settings")
      .optional()
      .isObject()
      .withMessage("Settings must be an object"),
  ],
  validate,
  updateOrganization
);

// Get organization members
router.get("/members", getOrganizationMembers);

// Get pending invitations (Admin only)
router.get("/invitations", authorize(UserRole.ADMIN), getPendingInvitations);

// Cancel invitation (Admin only)
router.delete(
  "/invitations/:invitationId",
  authorize(UserRole.ADMIN),
  [param("invitationId").isMongoId().withMessage("Invalid invitation ID")],
  validate,
  cancelInvitation
);

// Update member role (Admin only)
router.patch(
  "/members/:memberId/role",
  authorize(UserRole.ADMIN),
  [
    param("memberId").isMongoId().withMessage("Invalid member ID"),
    body("role")
      .isIn(Object.values(UserRole))
      .withMessage("Valid role required"),
  ],
  validate,
  updateMemberRole
);

// Remove member (Admin only)
router.delete(
  "/members/:memberId",
  authorize(UserRole.ADMIN),
  [param("memberId").isMongoId().withMessage("Invalid member ID")],
  validate,
  removeMember
);

export default router;
