import { Response } from "express";
import { Organization, User, Invitation } from "../models";
import { AuthRequest } from "../types";
import { AppError, asyncHandler } from "../middleware/errorHandler";
import { sendSuccess } from "../utils/response";

// Get current organization
export const getCurrentOrganization = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const user = req.user!;

    const organization = await Organization.findById(user.organizationId)
      .populate("createdBy", "email role")
      .populate("members", "email role isEmailVerified");

    if (!organization) {
      throw new AppError("Organization not found", 404);
    }

    sendSuccess(res, {
      id: organization._id,
      name: organization.name,
      createdBy: organization.createdBy,
      members: organization.members,
      settings: organization.settings,
      createdAt: organization.createdAt,
      updatedAt: organization.updatedAt,
    });
  }
);

// Update organization settings
export const updateOrganization = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const user = req.user!;
    const { name, settings } = req.body;

    const organization = await Organization.findById(user.organizationId);

    if (!organization) {
      throw new AppError("Organization not found", 404);
    }

    // Update fields
    if (name) {
      organization.name = name;
    }

    if (settings) {
      organization.settings = {
        ...organization.settings,
        ...settings,
      };
    }

    await organization.save();

    sendSuccess(
      res,
      {
        id: organization._id,
        name: organization.name,
        settings: organization.settings,
        updatedAt: organization.updatedAt,
      },
      "Organization updated successfully"
    );
  }
);

// Get organization members
export const getOrganizationMembers = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const user = req.user!;

    const members = await User.find({ organizationId: user.organizationId })
      .select("email role isEmailVerified createdAt")
      .sort({ createdAt: -1 });

    sendSuccess(res, {
      members,
      total: members.length,
    });
  }
);

// Get pending invitations
export const getPendingInvitations = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const user = req.user!;

    const invitations = await Invitation.find({
      organizationId: user.organizationId,
      status: "pending",
    })
      .populate("invitedBy", "email")
      .sort({ createdAt: -1 });

    sendSuccess(res, {
      invitations: invitations.map((inv) => ({
        id: inv._id,
        email: inv.email,
        role: inv.role,
        invitedBy: inv.invitedBy,
        expiresAt: inv.expiresAt,
        createdAt: inv.createdAt,
      })),
      total: invitations.length,
    });
  }
);

// Cancel invitation
export const cancelInvitation = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const user = req.user!;
    const { invitationId } = req.params;

    const invitation = await Invitation.findOne({
      _id: invitationId,
      organizationId: user.organizationId,
    });

    if (!invitation) {
      throw new AppError("Invitation not found", 404);
    }

    if (invitation.status !== "pending") {
      throw new AppError(
        `Cannot cancel invitation with status: ${invitation.status}`,
        400
      );
    }

    invitation.status = "cancelled";
    await invitation.save();

    sendSuccess(res, null, "Invitation cancelled successfully");
  }
);

// Remove member from organization
export const removeMember = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const user = req.user!;
    const { memberId } = req.params;

    const organization = await Organization.findById(user.organizationId);

    if (!organization) {
      throw new AppError("Organization not found", 404);
    }

    // Check if trying to remove the creator
    if (organization.createdBy.toString() === memberId) {
      throw new AppError("Cannot remove organization creator", 403);
    }

    // Check if trying to remove self
    if ((user._id as any).toString() === memberId) {
      throw new AppError("Cannot remove yourself. Contact admin instead.", 403);
    }

    const member = await User.findOne({
      _id: memberId,
      organizationId: user.organizationId,
    });

    if (!member) {
      throw new AppError("Member not found in this organization", 404);
    }

    // Remove member from organization
    organization.members = organization.members.filter(
      (m) => m.toString() !== memberId
    );
    await organization.save();

    // Delete the user
    await User.findByIdAndDelete(memberId);

    sendSuccess(res, null, "Member removed successfully");
  }
);

// Update member role
export const updateMemberRole = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const user = req.user!;
    const { memberId } = req.params;
    const { role } = req.body;

    const organization = await Organization.findById(user.organizationId);

    if (!organization) {
      throw new AppError("Organization not found", 404);
    }

    // Check if trying to change creator's role
    if (organization.createdBy.toString() === memberId) {
      throw new AppError("Cannot change organization creator's role", 403);
    }

    const member = await User.findOne({
      _id: memberId,
      organizationId: user.organizationId,
    });

    if (!member) {
      throw new AppError("Member not found in this organization", 404);
    }

    member.role = role;
    await member.save();

    sendSuccess(
      res,
      {
        id: member._id,
        email: member.email,
        role: member.role,
      },
      "Member role updated successfully"
    );
  }
);
